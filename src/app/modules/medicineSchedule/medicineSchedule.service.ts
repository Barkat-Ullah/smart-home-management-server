import httpStatus from 'http-status';
import { Prisma, ScheduleStatus } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import {
  medicineScheduleSelect,
  medicineScheduleWithLogsSelect,
} from './medicineSchedule.select';
import {
  buildScheduleFilterConditions,
  generateDosesForRange,
} from './medicineSchedule.utils';

// -------------------------------------------------------
// create MedicineSchedule
// -------------------------------------------------------
const createMedicineSchedule = async (req: Request) => {
  const userId = req.user.id;
  const {
    prescriptionId,
    medicineName,
    medicineForm,
    doseAmount,
    doseUnit,
    frequencyType,
    frequencyValue,
    timesPerDay,
    specificDays,
    specificDates,
    mealTiming,
    scheduledTimes,
    startDate,
    endDate,
    notes,
    sideEffects,
    refillReminder,
    refillAt,
  } = req.body;

  // Verify prescription belongs to user
  const prescription = await prisma.prescription.findFirst({
    where: { id: prescriptionId, userId },
  });
  if (!prescription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Prescription not found');
  }

  const schedule = await prisma.medicineSchedule.create({
    data: {
      userId,
      prescriptionId,
      medicineName,
      medicineForm,
      doseAmount,
      doseUnit,
      frequencyType,
      frequencyValue: frequencyValue ?? 1,
      timesPerDay: timesPerDay ?? scheduledTimes.length,
      specificDays: specificDays ?? [],
      specificDates: specificDates ?? [],
      mealTiming,
      scheduledTimes,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes,
      sideEffects,
      refillReminder: refillReminder ?? false,
      refillAt,
    },
    select: medicineScheduleSelect,
  });

  // Auto-generate reminders for next 7 days after creation
  await generateAndSaveReminders(schedule as any, 7);

  return schedule;
};

// -------------------------------------------------------
// get all MedicineSchedules (admin)
// -------------------------------------------------------
type IScheduleFilterRequest = {
  searchTerm?: string;
  status?: string;
  medicineForm?: string;
  frequencyType?: string;
  mealTiming?: string;
  prescriptionId?: string;
  createdAt?: string;
};

const scheduleSearchableFields = ['medicineName', 'notes'];

const getMedicineScheduleList = async (
  options: IPaginationOptions,
  filters: IScheduleFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.MedicineScheduleWhereInput[] = [
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: scheduleSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildScheduleFilterConditions(filterData));
  }

  const whereConditions: Prisma.MedicineScheduleWhereInput = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.medicineSchedule.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: medicineScheduleSelect,
    }),
    prisma.medicineSchedule.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get my MedicineSchedules (logged-in user)
// -------------------------------------------------------
const getMyMedicineSchedules = async (
  req: Request,
  options: IPaginationOptions,
  filters: IScheduleFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.MedicineScheduleWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: scheduleSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildScheduleFilterConditions(filterData));
  }

  const whereConditions: Prisma.MedicineScheduleWhereInput = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.medicineSchedule.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: medicineScheduleSelect,
    }),
    prisma.medicineSchedule.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get MedicineSchedule by id
// -------------------------------------------------------
const getMedicineScheduleById = async (id: string) => {
  const result = await prisma.medicineSchedule.findFirst({
    where: { id, isDeleted: false },
    select: medicineScheduleWithLogsSelect,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }

  return result;
};

// -------------------------------------------------------
// get today's schedules
// -------------------------------------------------------
const getTodaySchedules = async (req: Request) => {
  const userId = req.user.id;
  const today = new Date();

  const schedules = await prisma.medicineSchedule.findMany({
    where: {
      userId,
      isDeleted: false,
      status: ScheduleStatus.Active,
      startDate: { lte: endOfDay(today) },
      OR: [{ endDate: null }, { endDate: { gte: startOfDay(today) } }],
    },
    select: medicineScheduleWithLogsSelect,
    orderBy: { createdAt: 'desc' },
  });

  // Filter doseLogs to today only
  return schedules.map(s => ({
    ...s,
    doseLogs: (s as any).doseLogs?.filter((log: any) => {
      const d = new Date(log.scheduledAt);
      return d >= startOfDay(today) && d <= endOfDay(today);
    }),
  }));
};

// -------------------------------------------------------
// update MedicineSchedule
// -------------------------------------------------------
const updateMedicineSchedule = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.medicineSchedule.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }

  if (existing.userId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  // Convert date strings if provided
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  const result = await prisma.medicineSchedule.update({
    where: { id },
    data,
    select: medicineScheduleSelect,
  });

  return result;
};

// -------------------------------------------------------
// pause / resume / complete schedule
// -------------------------------------------------------
const updateScheduleStatus = async (
  id: string,
  userId: string,
  status: ScheduleStatus,
) => {
  const existing = await prisma.medicineSchedule.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }

  if (existing.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await prisma.medicineSchedule.update({
    where: { id },
    data: {
      status,
      // Set completedAt only when marking as Completed
      ...(status === ScheduleStatus.Completed && { completedAt: new Date() }),
    },
    select: medicineScheduleSelect,
  });

  return result;
};

// -------------------------------------------------------
// soft delete MedicineSchedule
// -------------------------------------------------------
const deleteMedicineSchedule = async (id: string) => {
  const existing = await prisma.medicineSchedule.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Medicine schedule not found');
  }


  const result = await prisma.medicineSchedule.update({
    where: { id },
    data: { isDeleted: true },
    select: { id: true },
  });

  return result;
};

// -------------------------------------------------------
// Internal: generate & save reminders
// -------------------------------------------------------
export const generateAndSaveReminders = async (
  schedule: {
    id: string;
    userId: string;
    frequencyType: any;
    frequencyValue: number;
    specificDays: string[];
    specificDates: number[];
    scheduledTimes: string[];
    startDate: Date;
    endDate: Date | null;
  },
  days: number,
) => {
  const from = new Date();
  const to = addDays(from, days);
  const doses = generateDosesForRange(schedule, from, to);

  if (!doses.length) return;

  // Reminder = 15 minutes before the scheduled dose time
  await prisma.medicineReminder.createMany({
    data: doses.map(dose => ({
      scheduleId: dose.scheduleId,
      userId: dose.userId,
      remindAt: new Date(dose.scheduledAt.getTime() - 15 * 60 * 1000),
      channel: 'push',
    })),
  });
};

export const medicineScheduleService = {
  createMedicineSchedule,
  getMedicineScheduleList,
  getMyMedicineSchedules,
  getMedicineScheduleById,
  getTodaySchedules,
  updateMedicineSchedule,
  updateScheduleStatus,
  deleteMedicineSchedule,
};
