import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { reminderService } from './medicineReminder.service';

const reminderFilterableFields = [
  'scheduleId',
  'status',
  'channel',
  'from',
  'to',
];

// -------------------------------------------------------
// get all reminders (admin)
// -------------------------------------------------------
const getReminderList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, reminderFilterableFields);
  const result = await reminderService.getReminderList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminder list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// -------------------------------------------------------
// get my reminders
// -------------------------------------------------------
const getMyReminders = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, reminderFilterableFields);
  const result = await reminderService.getMyReminders(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My reminders retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// -------------------------------------------------------
// get upcoming reminders (next 24h)
// -------------------------------------------------------
const getUpcomingReminders = catchAsync(async (req: Request, res: Response) => {
  const result = await reminderService.getUpcomingReminders(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Upcoming reminders retrieved successfully',
    data: result,
  });
});

// -------------------------------------------------------
// acknowledge reminder
// -------------------------------------------------------
const acknowledgeReminder = catchAsync(async (req: Request, res: Response) => {
  const result = await reminderService.acknowledgeReminder(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminder acknowledged successfully',
    data: result,
  });
});

// -------------------------------------------------------
// regenerate reminders for a schedule
// -------------------------------------------------------
const regenerateReminders = catchAsync(async (req: Request, res: Response) => {
  const result = await reminderService.regenerateReminders(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminders regenerated successfully',
    data: result,
  });
});

// -------------------------------------------------------
// update reminder channel
// -------------------------------------------------------
const updateReminderChannel = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reminderService.updateReminderChannel(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reminder channel updated successfully',
      data: result,
    });
  },
);

export const reminderController = {
  getReminderList,
  getMyReminders,
  getUpcomingReminders,
  acknowledgeReminder,
  regenerateReminders,
  updateReminderChannel,
};
