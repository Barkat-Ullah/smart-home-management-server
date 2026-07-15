import { Queue, Worker, Job } from 'bullmq';
import { NotifyType } from '@prisma/client';
import prisma from '../app/utils/prisma';
import { createNotification } from '../app/utils/notify';
import { bullMQRedisOptions } from '../lib/redis';

const QUEUE_NAME = 'custom-reminder-processing';

export const customReminderQueue = new Queue(QUEUE_NAME, {
  connection: bullMQRedisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

// -------------------------------------------------------
// Types
// -------------------------------------------------------
export interface CustomReminderJobData {
  userId: string;
  title: string;
  body: string;
  referenceId?: string;
  type?: NotifyType;
  scheduledAt?: string; // ISO string — if provided, job is delayed
}

// -------------------------------------------------------
// Processor: send custom reminder notification
// -------------------------------------------------------
const processCustomReminder = async (data: CustomReminderJobData) => {
  const { userId, title, body, referenceId, type } = data;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  await createNotification({
    receiverId: userId,
    senderId: null,
    title,
    body,
    referenceId: referenceId || null,
    type: type || NotifyType.MedicineDue,
  });

  return { success: true, userId };
};

// -------------------------------------------------------
// Worker
// -------------------------------------------------------
export const customReminderWorker = new Worker(
  QUEUE_NAME,
  async (job: Job<CustomReminderJobData>) => {
    console.log(`[customReminder] Running job ${job.id} for user ${job.data.userId}`);
    const result = await processCustomReminder(job.data);
    console.log(`[customReminder] Delivered reminder to ${job.data.userId}`);
    return result;
  },
  {
    connection: bullMQRedisOptions,
    concurrency: 5,
  },
);

customReminderWorker.on('completed', (job) => {
  console.log(`✅ customReminder job ${job.id} completed`);
});

customReminderWorker.on('failed', (job, err) => {
  console.error(`❌ customReminder job ${job?.id} failed:`, err.message);
});

// -------------------------------------------------------
// Helper: add a custom reminder to the queue
// -------------------------------------------------------
export const addCustomReminder = async (data: CustomReminderJobData) => {
  const jobOptions = data.scheduledAt
    ? { delay: new Date(data.scheduledAt).getTime() - Date.now() }
    : {};

  return customReminderQueue.add('send-custom-reminder', data, jobOptions);
};

// -------------------------------------------------------
// No repeatable schedule — this is an on-demand queue
// -------------------------------------------------------
