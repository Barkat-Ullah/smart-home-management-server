import { Prisma, DayOfWeek } from '@prisma/client';
import { startOfWeek, endOfWeek, addDays } from 'date-fns';

export const buildWeeklyPlanFilterConditions = (
  filterData: Record<string, any>,
): Prisma.WeeklyMealPlanWhereInput[] => {
  const conditions: Prisma.WeeklyMealPlanWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    if (key === 'status') {
      conditions.push({
        status: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    if (key === 'createdAt') {
      const start = new Date(value);
      start.setHours(0, 0, 0, 0);
      const end = new Date(value);
      end.setHours(23, 59, 59, 999);
      conditions.push({
        createdAt: { gte: start.toISOString(), lte: end.toISOString() },
      });
      return;
    }

    conditions.push({ [key]: value });
  });

  return conditions;
};

// -------------------------------------------------------
// Get the next weekNumber for a user (auto-increment per user)
// -------------------------------------------------------
export const getNextWeekNumber = async (
  prisma: any,
  userId: string,
): Promise<number> => {
  const last = await prisma.weeklyMealPlan.findFirst({
    where: { userId, isDeleted: false },
    orderBy: { weekNumber: 'desc' },
    select: { weekNumber: true },
  });

  return (last?.weekNumber ?? 0) + 1;
};

// -------------------------------------------------------
// Build the 7 MealPlanDay records for a week
// startDate must be Monday
// -------------------------------------------------------
const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
];

export const buildWeekDays = (
  weeklyPlanId: string,
  userId: string,
  startDate: Date, // Monday
): { weeklyPlanId: string; userId: string; day: DayOfWeek; date: Date }[] => {
  return DAY_ORDER.map((day, index) => ({
    weeklyPlanId,
    userId,
    day,
    date: addDays(startDate, index),
  }));
};

// -------------------------------------------------------
// Derive Monday of a week from any date
// -------------------------------------------------------
export const getMondayOfWeek = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
};

export const getSundayOfWeek = (date: Date): Date => {
  return endOfWeek(date, { weekStartsOn: 1 });
};
