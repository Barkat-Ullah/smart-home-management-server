import { Prisma, DoseLogStatus } from '@prisma/client';

// -------------------------------------------------------
// Filter conditions for dose logs
// -------------------------------------------------------
export const buildDoseLogFilterConditions = (
  filterData: Record<string, any>,
): Prisma.DoseLogWhereInput[] => {
  const conditions: Prisma.DoseLogWhereInput[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    if (key === 'from') {
      conditions.push({ scheduledAt: { gte: new Date(value) } });
      return;
    }

    if (key === 'to') {
      conditions.push({ scheduledAt: { lte: new Date(value) } });
      return;
    }

    if (key === 'status') {
      conditions.push({
        status: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    conditions.push({ [key]: value });
  });

  return conditions;
};

// -------------------------------------------------------
// Adherence calculation
// -------------------------------------------------------
export interface AdherenceStats {
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  lateDoses: number;
  adherenceRate: number; // 0–100
}

export function calculateAdherence(
  logs: { status: DoseLogStatus }[],
): AdherenceStats {
  const total = logs.length;
  const taken = logs.filter(l => l.status === DoseLogStatus.Taken).length;
  const missed = logs.filter(l => l.status === DoseLogStatus.Missed).length;
  const skipped = logs.filter(l => l.status === DoseLogStatus.Skipped).length;
  const late = logs.filter(l => l.status === DoseLogStatus.Late).length;

  // Taken + Late both count as "adhered"
  const adherenceRate =
    total > 0 ? Math.round(((taken + late) / total) * 100) : 0;

  return {
    totalDoses: total,
    takenDoses: taken,
    missedDoses: missed,
    skippedDoses: skipped,
    lateDoses: late,
    adherenceRate,
  };
}
