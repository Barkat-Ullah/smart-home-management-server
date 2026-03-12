import httpStatus from 'http-status';
import { Prisma, ReminderStatus } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { addDays } from 'date-fns';
import { reminderSelect } from './medicineReminder.select';
import { buildReminderFilterConditions } from './medicineReminder.utils';
import { generateAndSaveReminders } from '../medicineSchedule/medicineSchedule.service';

// -------------------------------------------------------
// get all reminders (admin)
// -------------------------------------------------------
type IReminderFilterRequest = {
  scheduleId?: string;
  status?: string;
  channel?: string;
  from?: string;
  to?: string;
};

const getReminderList = async (
  options: IPaginationOptions,
  filters: IReminderFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.MedicineReminderWhereInput[] = [];

  if (Object.keys(filterData).length) {
    andConditions.push(...buildReminderFilterConditions(filterData));
  }

  const whereConditions: Prisma.MedicineReminderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.medicineReminder.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { remindAt: 'asc' },
      select: reminderSelect,
    }),
    prisma.medicineReminder.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get my reminders
// -------------------------------------------------------
const getMyReminders = async (
  req: Request,
  options: IPaginationOptions,
  filters: IReminderFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.MedicineReminderWhereInput[] = [{ userId }];

  if (Object.keys(filterData).length) {
    andConditions.push(...buildReminderFilterConditions(filterData));
  }

  const whereConditions: Prisma.MedicineReminderWhereInput = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.medicineReminder.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { remindAt: 'asc' },
      select: reminderSelect,
    }),
    prisma.medicineReminder.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get upcoming reminders (next 24h)
// -------------------------------------------------------
const getUpcomingReminders = async (req: Request) => {
  const userId = req.user.id;
  const now = new Date();
  const next24h = addDays(now, 1);

  const result = await prisma.medicineReminder.findMany({
    where: {
      userId,
      status: ReminderStatus.Pending,
      remindAt: { gte: now, lte: next24h },
    },
    orderBy: { remindAt: 'asc' },
    select: reminderSelect,
  });

  return result;
};

// -------------------------------------------------------
// acknowledge a reminder
// -------------------------------------------------------
const acknowledgeReminder = async (id: string, userId: string) => {
  const existing = await prisma.medicineReminder.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reminder not found');
  }

  const result = await prisma.medicineReminder.update({
    where: { id },
    data: { status: ReminderStatus.Acknowledged },
    select: reminderSelect,
  });

  return result;
};

// -------------------------------------------------------
// regenerate reminders for a schedule
// -------------------------------------------------------
const regenerateReminders = async (req: Request) => {
  const userId = req.user.id;
  const { scheduleId } = req.params;
  const days = Number(req.query.days) || 7;

  const schedule = await prisma.medicineSchedule.findFirst({
    where: { id: scheduleId, userId, isDeleted: false },
  });

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }

  // Delete future pending reminders before regenerating
  await prisma.medicineReminder.deleteMany({
    where: {
      scheduleId,
      status: ReminderStatus.Pending,
      remindAt: { gte: new Date() },
    },
  });

  await generateAndSaveReminders(schedule as any, days);

  return { scheduleId, daysGenerated: days };
};

// -------------------------------------------------------
// update reminder channel for a schedule
// -------------------------------------------------------
const updateReminderChannel = async (req: Request) => {
  const userId = req.user.id;
  const { scheduleId } = req.params;
  const { channel } = req.body;

  const schedule = await prisma.medicineSchedule.findFirst({
    where: { id: scheduleId, userId },
  });

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }

  await prisma.medicineReminder.updateMany({
    where: {
      scheduleId,
      userId,
      status: ReminderStatus.Pending,
    },
    data: { channel },
  });

  return { scheduleId, channel };
};

export const reminderService = {
  getReminderList,
  getMyReminders,
  getUpcomingReminders,
  acknowledgeReminder,
  regenerateReminders,
  updateReminderChannel,
};
