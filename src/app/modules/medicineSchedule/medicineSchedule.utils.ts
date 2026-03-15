import { FrequencyType, Prisma } from '@prisma/client';
import { addDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import {
  toUTCEndOfDay,
  toUTCEndOfMonth,
  toUTCStartOfDay,
  toUTCStartOfMonth,
} from '../event/event.utils';

// -------------------------------------------------------
// Schedule filter conditions (same pattern as prescription.utils)
// -------------------------------------------------------
export const buildScheduleFilterConditions = (
  filterData: Record<string, any>,
): Prisma.MedicineScheduleWhereInput[] => {
  const conditions: Prisma.MedicineScheduleWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;
    if (key === 'createdAt') {
      const parts = (value as string).split('-');

      if (parts.length === 2) {
        // Format: "YYYY-MM" →
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        conditions.push({
          createdAt: {
            gte: toUTCStartOfMonth(year, month),
            lte: toUTCEndOfMonth(year, month),
          },
        });
      } else if (parts.length === 3) {
        // Format: "YYYY-MM-DD" →
        conditions.push({
          createdAt: {
            gte: toUTCStartOfDay(value),
            lte: toUTCEndOfDay(value),
          },
        });
      }
      return;
    }

    // status, medicineForm, frequencyType — enum filter
    if (
      ['status', 'medicineForm', 'frequencyType', 'mealTiming'].includes(key)
    ) {
      conditions.push({
        [key]: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    conditions.push({ [key]: value });
  });

  return conditions;
};

// -------------------------------------------------------
// Dose generation — for reminder auto-creation
// -------------------------------------------------------
export interface ScheduledDose {
  scheduleId: string;
  userId: string;
  scheduledAt: Date;
}

export function generateDosesForRange(
  schedule: {
    id: string;
    userId: string;
    frequencyType: FrequencyType;
    frequencyValue: number;
    specificDays: string[];
    specificDates: number[];
    scheduledTimes: string[];
    startDate: Date;
    endDate: Date | null;
  },
  from: Date,
  to: Date,
): ScheduledDose[] {
  const doses: ScheduledDose[] = [];
  const rangeStart = startOfDay(from);
  const rangeEnd = endOfDay(to);
  const scheduleStart = startOfDay(schedule.startDate);
  const scheduleEnd = schedule.endDate ? endOfDay(schedule.endDate) : null;

  const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  let cursor = new Date(
    Math.max(rangeStart.getTime(), scheduleStart.getTime()),
  );

  while (!isAfter(cursor, rangeEnd)) {
    if (scheduleEnd && isAfter(cursor, scheduleEnd)) break;

    let shouldDose = false;
    const dayDiff = Math.round(
      (startOfDay(cursor).getTime() - scheduleStart.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    switch (schedule.frequencyType) {
      case FrequencyType.Daily:
        shouldDose = dayDiff % schedule.frequencyValue === 0;
        break;
      case FrequencyType.Weekly:
        shouldDose = schedule.specificDays.includes(DAY_NAMES[cursor.getDay()]);
        break;
      case FrequencyType.Monthly:
        shouldDose = schedule.specificDates.includes(cursor.getDate());
        break;
      case FrequencyType.Custom:
        // Custom = every N days (frequencyValue = N)
        shouldDose = dayDiff % schedule.frequencyValue === 0;
        break;
    }

    if (shouldDose) {
      for (const time of schedule.scheduledTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        const doseTime = new Date(cursor);
        doseTime.setHours(hours, minutes, 0, 0);

        if (!isBefore(doseTime, rangeStart) && !isAfter(doseTime, rangeEnd)) {
          doses.push({
            scheduleId: schedule.id,
            userId: schedule.userId,
            scheduledAt: doseTime,
          });
        }
      }
    }

    cursor = addDays(cursor, 1);
  }

  return doses;
}

// -------------------------------------------------------
// Auto-resolve Taken vs Late (grace: 60 min)
// -------------------------------------------------------
export function resolveDoseStatus(
  scheduledAt: Date,
  takenAt: Date,
  graceMinutes = 60,
) {
  const diffMinutes = (takenAt.getTime() - scheduledAt.getTime()) / (1000 * 60);
  return diffMinutes <= graceMinutes ? 'Taken' : 'Late';
}
