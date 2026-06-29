import httpStatus from 'http-status';
import { DoseLogStatus, Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import {
  cacheOr,
  CacheKeys,
  TTL,
  CacheInvalidator,
  invalidateKeys,
  invalidatePattern,
} from '../../../lib/redis';
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

const DOSELOG_MODEL = 'doseLog';

// -------------------------------------------------------
// log a dose (create or update for same slot)
// -------------------------------------------------------
const logDose = async (req: Request) => {
  const userId = req.user.id;
  const { scheduleId, scheduledAt, takenAt, status, skipReason, note } =
    req.body;

  const scheduledAtDate = new Date(scheduledAt);
  const takenAtDate = takenAt ? new Date(takenAt) : undefined;

  const schedule = await prisma.medicineSchedule.findFirst({
    where: { id: scheduleId, userId, isDeleted: false },
  });
  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }

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
    const result = await prisma.doseLog.update({
      where: { id: existing.id },
      data: { takenAt: takenAtDate, status: resolvedStatus, skipReason, note },
      select: doseLogSelect,
    });
    return result;
  }

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

  const cacheKey = CacheKeys.list(DOSELOG_MODEL, { ...options, ...filters });
  return cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(
    cacheKey,
    TTL.SHORT,
    async () => {
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
    },
  ) ?? { meta: { total: 0, page, limit }, data: [] };
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

  const cacheKey = CacheKeys.myList(DOSELOG_MODEL, userId, { ...options, ...filters });
  return cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(
    cacheKey,
    TTL.SHORT,
    async () => {
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
    },
  ) ?? { meta: { total: 0, page, limit }, data: [] };
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

  const overall = calculateAdherence(logs);

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