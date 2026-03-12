import express from 'express';
import auth from '../../middlewares/auth';
import { reminderController } from './medicineReminder.controller';

const router = express.Router();

// NOTE: /upcoming and /my must be before /:id
router.get('/upcoming', auth(), reminderController.getUpcomingReminders);
router.get('/my', auth(), reminderController.getMyReminders);

// GET /reminders — admin: all reminders with filters
router.get('/', auth(), reminderController.getReminderList);

// PATCH /reminders/:id/acknowledge
router.patch(
  '/:id/acknowledge',
  auth(),
  reminderController.acknowledgeReminder,
);

// POST /reminders/:scheduleId/regenerate?days=7
router.post(
  '/:scheduleId/regenerate',
  auth(),
  reminderController.regenerateReminders,
);

// PATCH /reminders/:scheduleId/channel — change push/sms/email
router.patch(
  '/:scheduleId/channel',
  auth(),
  reminderController.updateReminderChannel,
);

export const reminderRoutes = router;
