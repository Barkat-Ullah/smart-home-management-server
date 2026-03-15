import { Prisma } from '@prisma/client';
import { toUTCEndOfDay, toUTCEndOfMonth, toUTCStartOfDay, toUTCStartOfMonth } from '../event/event.utils';

// ─────────────────────────────────────────────
// Financial Filter Builder
// ─────────────────────────────────────────────
export const buildFinancialFilterConditions = (
  filterData: Record<string, any>,
  model: 'transaction' | 'budget' | 'goal' | 'profile' | 'snapshot',
): any[] => {
  const conditions: any[] = [];

  Object.keys(filterData).forEach(key => {
    const value = filterData[key];
    if (value === '' || value === null || value === undefined) return;

    // ── Date range filter ──────────────────────────────────
    if (['date', 'createdAt', 'startDate', 'targetDate'].includes(key)) {
      const parts = (value as string).split('-');

      if (parts.length === 2) {
        // Format: "YYYY-MM" →
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        conditions.push({
          [key]: {
            gte: toUTCStartOfMonth(year, month),
            lte: toUTCEndOfMonth(year, month),
          },
        });
      } else if (parts.length === 3) {
        // Format: "YYYY-MM-DD" →
        conditions.push({
          [key]: {
            gte: toUTCStartOfDay(value),
            lte: toUTCEndOfDay(value),
          },
        });
      }
      return;
    }

    // ── Enum multi-value filters ───────────────────────────
    const enumFields = ['type', 'category', 'status', 'period', 'priority'];
    if (enumFields.includes(key)) {
      conditions.push({
        [key]: { in: Array.isArray(value) ? value : [value] },
      });
      return;
    }

    // ── Numeric range: amount_gte / amount_lte ─────────────
    if (key === 'amount_gte') {
      conditions.push({ amount: { gte: parseFloat(value) } });
      return;
    }
    if (key === 'amount_lte') {
      conditions.push({ amount: { lte: parseFloat(value) } });
      return;
    }

    // ── Month / Year exact match ───────────────────────────
    if (key === 'month' || key === 'year') {
      conditions.push({ [key]: parseInt(value) });
      return;
    }

    // ── Boolean fields ─────────────────────────────────────
    if (key === 'isRecurring' || key === 'isAlertSent') {
      conditions.push({ [key]: value === 'true' || value === true });
      return;
    }

    // ── Direct match ───────────────────────────────────────
    conditions.push({ [key]: value });
  });

  return conditions;
};
// ─────────────────────────────────────────────
// Recalculate & update FinancialProfile totals
// after any transaction create/update/delete
// ─────────────────────────────────────────────
export const recalculateProfileTotals = async (
  prisma: any,
  financialProfileId: string,
) => {
  const [incomeAgg, expenseAgg, savingAgg, investmentAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { financialProfileId, type: 'Income', isDeleted: false },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { financialProfileId, type: 'Expense', isDeleted: false },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { financialProfileId, type: 'Saving', isDeleted: false },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { financialProfileId, type: 'Investment', isDeleted: false },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpense = expenseAgg._sum.amount ?? 0;
  const totalSaving = savingAgg._sum.amount ?? 0;
  const totalInvestment = investmentAgg._sum.amount ?? 0;
  const netBalance = totalIncome - totalExpense;

  await prisma.financialProfile.update({
    where: { id: financialProfileId },
    data: {
      totalIncome,
      totalExpense,
      totalSaving,
      totalInvestment,
      netBalance,
    },
  });
};

// ─────────────────────────────────────────────
// Recalculate budget spentAmount & remainingAmount
// after any expense transaction change
// ─────────────────────────────────────────────
export const recalculateBudgetSpend = async (
  prisma: any,
  financialProfileId: string,
  category: string,
) => {
  const budget = await prisma.budget.findFirst({
    where: { financialProfileId, category },
  });
  if (!budget) return;

  const spentAgg = await prisma.transaction.aggregate({
    where: {
      financialProfileId,
      category,
      type: 'Expense',
      isDeleted: false,
    },
    _sum: { amount: true },
  });

  const spentAmount = spentAgg._sum.amount ?? 0;
  const remainingAmount = Math.max(budget.limitAmount - spentAmount, 0);
  const isAlertSent =
    budget.alertThreshold > 0
      ? spentAmount / budget.limitAmount >= budget.alertThreshold / 100
      : false;

  await prisma.budget.update({
    where: { id: budget.id },
    data: { spentAmount, remainingAmount, isAlertSent },
  });
};
