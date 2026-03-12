import httpStatus from 'http-status';
import { DoseLogStatus, Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { subDays, startOfDay } from 'date-fns';
import { doseLogSelect } from './doseLog.select';
import {
  buildDoseLogFilterConditions,
  calculateAdherence,
} from './doseLog.utils';
import { resolveDoseStatus } from '../medicineSchedule/medicineSchedule.utils';



// -------------------------------------------------------
// log a dose (create or update for same slot)
// -------------------------------------------------------
const logDose = async (req: Request) => {
  const userId = req.user.id;
  const { scheduleId, scheduledAt, takenAt, status, skipReason, note } =
    req.body;

  const scheduledAtDate = new Date(scheduledAt);
  const takenAtDate = takenAt ? new Date(takenAt) : undefined;

  // Verify schedule belongs to user
  const schedule = await prisma.medicineSchedule.findFirst({
    where: { id: scheduleId, userId, isDeleted: false },
  });
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }

  // Auto-resolve Taken vs Late based on grace period (60 min)
  let resolvedStatus: DoseLogStatus = status;
  if (
    (status === DoseLogStatus.Taken || status === DoseLogStatus.Late) &&
    takenAtDate
  ) {
    resolvedStatus = resolveDoseStatus(
      scheduledAtDate,
      takenAtDate,
    ) as DoseLogStatus;
  }

  // Check if a log already exists for this dose slot (±30 min window)
  const existing = await prisma.doseLog.findFirst({
    where: {
      scheduleId,
      userId,
      scheduledAt: {
        gte: new Date(scheduledAtDate.getTime() - 30 * 60 * 1000),
        lte: new Date(scheduledAtDate.getTime() + 30 * 60 * 1000),
      },
    },
  });

  if (existing) {
    // Update existing log for this slot
    const result = await prisma.doseLog.update({
      where: { id: existing.id },
      data: { takenAt: takenAtDate, status: resolvedStatus, skipReason, note },
      select: doseLogSelect,
    });
    return result;
  }

  // Create new dose log
  const result = await prisma.doseLog.create({
    data: {
      scheduleId,
      userId,
      scheduledAt: scheduledAtDate,
      takenAt: takenAtDate,
      status: resolvedStatus,
      skipReason,
      note,
    },
    select: doseLogSelect,
  });

  return result;
};

// -------------------------------------------------------
// get all dose logs (admin)
// -------------------------------------------------------
type IDoseLogFilterRequest = {
  searchTerm?: string;
  scheduleId?: string;
  status?: string;
  from?: string;
  to?: string;
};

const getDoseLogList = async (
  options: IPaginationOptions,
  filters: IDoseLogFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.DoseLogWhereInput[] = [];

  if (Object.keys(filterData).length) {
    andConditions.push(...buildDoseLogFilterConditions(filterData));
  }

  const whereConditions: Prisma.DoseLogWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.doseLog.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { scheduledAt: 'desc' },
      select: doseLogSelect,
    }),
    prisma.doseLog.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get my dose logs
// -------------------------------------------------------
const getMyDoseLogs = async (
  req: Request,
  options: IPaginationOptions,
  filters: IDoseLogFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.DoseLogWhereInput[] = [{ userId }];

  if (Object.keys(filterData).length) {
    andConditions.push(...buildDoseLogFilterConditions(filterData));
  }

  const whereConditions: Prisma.DoseLogWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.doseLog.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { scheduledAt: 'desc' },
      select: doseLogSelect,
    }),
    prisma.doseLog.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// adherence report
// -------------------------------------------------------
const getAdherenceReport = async (req: Request) => {
  const userId = req.user.id;
  const days = Number(req.query.days) || 30;
  const scheduleId = req.query.scheduleId as string | undefined;

  const from = subDays(new Date(), days);

  const where: Prisma.DoseLogWhereInput = {
    userId,
    scheduledAt: { gte: startOfDay(from) },
    ...(scheduleId && { scheduleId }),
  };

  const logs = await prisma.doseLog.findMany({
    where,
    select: { status: true, scheduleId: true },
  });

  // Overall adherence
  const overall = calculateAdherence(logs);

  // Per-schedule breakdown
  const scheduleMap = new Map<string, { status: DoseLogStatus }[]>();
  for (const log of logs) {
    const arr = scheduleMap.get(log.scheduleId) || [];
    arr.push(log);
    scheduleMap.set(log.scheduleId, arr);
  }

  const bySchedule = Array.from(scheduleMap.entries()).map(([sid, sLogs]) => ({
    scheduleId: sid,
    ...calculateAdherence(sLogs),
  }));

  return { period: `${days} days`, overall, bySchedule };
};

export const doseLogService = {
  logDose,
  getDoseLogList,
  getMyDoseLogs,
  getAdherenceReport,
};
