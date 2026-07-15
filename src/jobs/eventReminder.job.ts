import { Queue, Worker, Job } from 'bullmq';
import { EventStatus, NotifyType } from '@prisma/client';
import prisma from '../app/utils/prisma';
import { createNotification } from '../app/utils/notify';
import { bullMQRedisOptions } from '../lib/redis';
import { subMinutes } from 'date-fns';

const QUEUE_NAME = 'event-reminder-processing';

export const eventReminderQueue = new Queue(QUEUE_NAME, {
  connection: bullMQRedisOptions,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 20,
    removeOnFail: 10,
  },
});

// -------------------------------------------------------
// Processor: send event reminders
// -------------------------------------------------------
const processEventReminders = async () => {
  const now = new Date();

  // Find upcoming events that need reminders
  // Events where eventDate is within reminderMinutes from now
  // and reminder hasn't been sent yet
  const upcomingEvents = await prisma.event.findMany({
    where: {
      isDeleted: false,
      status: EventStatus.Upcoming,
      isReminderSent: false,
      reminderMinutes: { not: null },
      eventDate: {
        gte: now,
        lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // next 24h
      },
    },
    select: {
      id: true,
      userId: true,
      title: true,
      category: true,
      eventDate: true,
      eventTime: true,
      location: true,
      reminderMinutes: true,
    },
  });

  if (!upcomingEvents.length) return { sent: 0 };

  let sent = 0;

  for (const event of upcomingEvents) {
    // Calculate reminder trigger time
    const reminderAt = new Date(
      event.eventDate.getTime() - (event.reminderMinutes || 15) * 60 * 1000,
    );

    // Only send if we're at or past the reminder time
    if (now < reminderAt) continue;

    const timeLabel = event.eventTime || event.eventDate.toLocaleTimeString();
    const locationLabel = event.location ? ` at ${event.location}` : '';

    await createNotification({
      receiverId: event.userId,
      senderId: null,
      title: 'Event Reminder',
      body: `Upcoming: ${event.title} on ${event.category}${locationLabel}. Time: ${timeLabel}`,
      referenceId: event.id,
      type: NotifyType.EventReminder,
    }).catch(() => {});

    // Mark reminder as sent
    await prisma.event.update({
      where: { id: event.id },
      data: { isReminderSent: true },
    });

    sent++;
  }

  return { sent };
};

// -------------------------------------------------------
// Worker
// -------------------------------------------------------
export const eventReminderWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    console.log(`[eventReminder] Running job ${job.id}`);
    const result = await processEventReminders();
    console.log(`[eventReminder] Sent ${result.sent} event reminders`);
    return result;
  },
  {
    connection: bullMQRedisOptions,
    concurrency: 1,
  },
);

eventReminderWorker.on('completed', (job) => {
  console.log(`✅ eventReminder job ${job.id} completed`);
});

eventReminderWorker.on('failed', (job, err) => {
  console.error(`❌ eventReminder job ${job?.id} failed:`, err.message);
});

// -------------------------------------------------------
// Schedule: repeat every 5 minutes
// -------------------------------------------------------
export const scheduleEventReminderJob = async () => {
  await eventReminderQueue.upsertJobScheduler(
    'event-reminder-scheduler',
    { every: 5 * 60 * 1000 }, // every 5 minutes
    { name: 'process-event-reminders' },
  );
  console.log('✅ eventReminder repeatable job scheduled (every 5m)');
};

export const removeEventReminderSchedule = async () => {
  await eventReminderQueue.removeJobScheduler('event-reminder-scheduler');
};
