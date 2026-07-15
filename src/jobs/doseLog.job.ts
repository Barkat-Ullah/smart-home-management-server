import { Queue, Worker, Job } from 'bullmq';
import { DoseLogStatus, NotifyType, ScheduleStatus } from '@prisma/client';
import prisma from '../app/utils/prisma';
import { createNotification } from '../app/utils/notify';
import { bullMQRedisOptions } from '../lib/redis';
import { subMinutes } from 'date-fns';

const QUEUE_NAME = 'dose-log-processing';

export const doseLogQueue = new Queue(QUEUE_NAME, {
  connection: bullMQRedisOptions,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 20,
    removeOnFail: 10,
  },
});

// -------------------------------------------------------
// Processor: auto-mark missed doses
// -------------------------------------------------------
const PROCESS_GRACE_MINUTES = 60;

const processMissedDoses = async () => {
  const cutoff = subMinutes(new Date(), PROCESS_GRACE_MINUTES);

  // Find active schedules with scheduled times that have already passed
  const activeSchedules = await prisma.medicineSchedule.findMany({
    where: {
      isDeleted: false,
      status: ScheduleStatus.Active,
      startDate: { lte: new Date() },
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    },
    select: {
      id: true,
      userId: true,
      scheduledTimes: true,
    },
  });

  if (!activeSchedules.length) return { processed: 0 };

  let processed = 0;

  // For each schedule, check today's scheduled times
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  for (const schedule of activeSchedules) {
    for (const time of schedule.scheduledTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(today);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Only process times that have passed the grace period
      if (scheduledAt > cutoff) continue;
      if (scheduledAt < todayStart || scheduledAt > todayEnd) continue;

      // Check if a dose log already exists for this slot
      const existing = await prisma.doseLog.findFirst({
        where: {
          scheduleId: schedule.id,
          userId: schedule.userId,
          scheduledAt: {
            gte: new Date(scheduledAt.getTime() - 30 * 60 * 1000),
            lte: new Date(scheduledAt.getTime() + 30 * 60 * 1000),
          },
        },
      });

      if (existing) continue;

      // Create missed dose log
      await prisma.doseLog.create({
        data: {
          scheduleId: schedule.id,
          userId: schedule.userId,
          scheduledAt,
          status: DoseLogStatus.Missed,
        },
      });

      // Send missed dose notification
      await createNotification({
        receiverId: schedule.userId,
        senderId: null,
        title: 'Missed Dose',
        body: `You missed your scheduled dose. Please consult your healthcare provider if needed.`,
        referenceId: schedule.id,
        type: NotifyType.MedicineMissed,
      }).catch(() => {}); // fire-and-forget

      processed++;
    }
  }

  return { processed };
};

// -------------------------------------------------------
// Worker
// -------------------------------------------------------
export const doseLogWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    console.log(`[doseLog] Running job ${job.id}`);
    const result = await processMissedDoses();
    console.log(`[doseLog] Processed ${result.processed} missed doses`);
    return result;
  },
  {
    connection: bullMQRedisOptions,
    concurrency: 1,
  },
);

doseLogWorker.on('completed', (job) => {
  console.log(`✅ doseLog job ${job.id} completed`);
});

doseLogWorker.on('failed', (job, err) => {
  console.error(`❌ doseLog job ${job?.id} failed:`, err.message);
});

// -------------------------------------------------------
// Schedule: repeat every 5 minutes
// -------------------------------------------------------
export const scheduleDoseLogJob = async () => {
  await doseLogQueue.upsertJobScheduler(
    'dose-log-scheduler',
    { every: 5 * 60 * 1000 }, // every 5 minutes
    { name: 'process-missed-doses' },
  );
  console.log('✅ doseLog repeatable job scheduled (every 5m)');
};

export const removeDoseLogSchedule = async () => {
  await doseLogQueue.removeJobScheduler('dose-log-scheduler');
};
