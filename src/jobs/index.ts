import {
  doseLogQueue,
  doseLogWorker,
  scheduleDoseLogJob,
} from './doseLog.job';
import {
  medicineReminderQueue,
  medicineReminderWorker,
  scheduleMedicineReminderJob,
} from './medicineReminder.job';
import {
  eventReminderQueue,
  eventReminderWorker,
  scheduleEventReminderJob,
} from './eventReminder.job';
import {
  customReminderQueue,
  customReminderWorker,
} from './customReminder.job';

// -------------------------------------------------------
// Initialize all background jobs
// -------------------------------------------------------
export const initializeJobs = async () => {
  // Schedule repeatable jobs
  await Promise.all([
    scheduleDoseLogJob(),
    scheduleMedicineReminderJob(),
    scheduleEventReminderJob(),
  ]);

  console.log('✅ All background jobs initialized');

  return {
    doseLogWorker,
    medicineReminderWorker,
    eventReminderWorker,
    customReminderWorker,
  };
};

// -------------------------------------------------------
// Graceful shutdown
// -------------------------------------------------------
export const closeAllJobs = async () => {
  await Promise.all([
    doseLogWorker.close(),
    medicineReminderWorker.close(),
    eventReminderWorker.close(),
    customReminderWorker.close(),
    doseLogQueue.close(),
    medicineReminderQueue.close(),
    eventReminderQueue.close(),
    customReminderQueue.close(),
  ]);
  console.log('✅ All job queues closed');
};

export { addCustomReminder } from './customReminder.job';
