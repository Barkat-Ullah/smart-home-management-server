import { Queue, Worker, Job } from 'bullmq';
import { ReminderStatus, NotifyType } from '@prisma/client';
import prisma from '../app/utils/prisma';
import { createNotification } from '../app/utils/notify';
import { bullMQRedisOptions } from '../lib/redis';

const QUEUE_NAME = 'medicine-reminder-processing';

export const medicineReminderQueue = new Queue(QUEUE_NAME, {
  connection: bullMQRedisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 30,
    removeOnFail: 15,
  },
});

// -------------------------------------------------------
// Processor: send due medicine reminders
// -------------------------------------------------------
const processDueReminders = async () => {
  const now = new Date();

  // Fetch pending reminders that are due (remindAt <= now)
  const dueReminders = await prisma.medicineReminder.findMany({
    where: {
      status: ReminderStatus.Pending,
      remindAt: { lte: now },
    },
    include: {
      schedule: {
        select: {
          id: true,
          medicineName: true,
          doseAmount: true,
          doseUnit: true,
          mealTiming: true,
        },
      },
    },
    orderBy: { remindAt: 'asc' },
    take: 50, // process in batches
  });

  if (!dueReminders.length) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const reminder of dueReminders) {
    try {
      const { schedule } = reminder;
      const mealLabel = schedule.mealTiming !== 'AnyTime'
        ? ` (${schedule.mealTiming.toLowerCase()})`
        : '';

      // Create in-app notification
      await createNotification({
        receiverId: reminder.userId,
        senderId: null,
        title: 'Medicine Reminder',
        body: `Time to take ${schedule.doseAmount} ${schedule.doseUnit} of ${schedule.medicineName}${mealLabel}`,
        referenceId: reminder.id,
        type: NotifyType.MedicineDue,
      });

      // Update reminder status
      await prisma.medicineReminder.update({
        where: { id: reminder.id },
        data: {
          status: ReminderStatus.Sent,
          sentAt: now,
        },
      });

      sent++;
    } catch (err: any) {
      // Mark as failed to avoid infinite retries
      await prisma.medicineReminder.update({
        where: { id: reminder.id },
        data: {
          status: ReminderStatus.Failed,
          failReason: err.message?.slice(0, 500),
        },
      }).catch(() => {});

      failed++;
    }
  }

  return { sent, failed };
};

// -------------------------------------------------------
// Worker
// -------------------------------------------------------
export const medicineReminderWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    console.log(`[medicineReminder] Running job ${job.id}`);
    const result = await processDueReminders();
    console.log(`[medicineReminder] Sent: ${result.sent}, Failed: ${result.failed}`);
    return result;
  },
  {
    connection: bullMQRedisOptions,
    concurrency: 1,
  },
);

medicineReminderWorker.on('completed', (job) => {
  console.log(`✅ medicineReminder job ${job.id} completed`);
});

medicineReminderWorker.on('failed', (job, err) => {
  console.error(`❌ medicineReminder job ${job?.id} failed:`, err.message);
});

// -------------------------------------------------------
// Schedule: repeat every minute
// -------------------------------------------------------
export const scheduleMedicineReminderJob = async () => {
  await medicineReminderQueue.upsertJobScheduler(
    'medicine-reminder-scheduler',
    { every: 60 * 1000 }, // every 1 minute
    { name: 'process-due-reminders' },
  );
  console.log('✅ medicineReminder repeatable job scheduled (every 1m)');
};

export const removeMedicineReminderSchedule = async () => {
  await medicineReminderQueue.removeJobScheduler('medicine-reminder-scheduler');
};
