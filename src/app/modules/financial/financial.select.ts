import { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────
// Financial Profile Select
// ─────────────────────────────────────────────
export const financialProfileSelect = {
  id: true,
  userId: true,
  month: true,
  year: true,
  totalIncome: true,
  totalExpense: true,
  totalSaving: true,
  totalInvestment: true,
  netBalance: true,
  currency: true,
  notes: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, email: true, image: true } },
  salaryInfo: true,
  transactions: false,
  budgets: false,

} satisfies Prisma.FinancialProfileSelect;

// ─────────────────────────────────────────────
// Transaction Select
// ─────────────────────────────────────────────
export const transactionSelect = {
  id: true,
  userId: true,
  financialProfileId: true,
  title: true,
  description: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  isRecurring: true,
  recurringDay: true,
  tags: true,
  files: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, email: true } },
  financialProfile: {
    select: { id: true, month: true, year: true, currency: true },
  },
} satisfies Prisma.TransactionSelect;

// ─────────────────────────────────────────────
// Budget Select
// ─────────────────────────────────────────────
export const budgetSelect = {
  id: true,
  userId: true,
  financialProfileId: true,
  category: true,
  period: true,
  limitAmount: true,
  spentAmount: true,
  remainingAmount: true,
  alertThreshold: true,
  isAlertSent: true,
  month: true,
  year: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, email: true } },
  financialProfile: {
    select: { id: true, month: true, year: true, currency: true },
  },
} satisfies Prisma.BudgetSelect;

// ─────────────────────────────────────────────
// Financial Goal Select
// ─────────────────────────────────────────────
export const financialGoalSelect = {
  id: true,
  userId: true,
  title: true,
  description: true,
  targetAmount: true,
  savedAmount: true,
  remainingAmount: true,
  startDate: true,
  targetDate: true,
  achievedDate: true,
  status: true,
  priority: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, email: true } },

} satisfies Prisma.FinancialGoalSelect;

// ─────────────────────────────────────────────
// Salary Info Select
// ─────────────────────────────────────────────
export const salaryInfoSelect = {
  id: true,
  financialProfileId: true,
  basicSalary: true,
  houseRentAllowance: true,
  medicalAllowance: true,
  transportAllowance: true,
  bonus: true,
  otherAllowance: true,
  taxDeduction: true,
  providentFund: true,
  netSalary: true,
  salaryDate: true,
  createdAt: true,
  updatedAt: true,
  financialProfile: {
    select: { id: true, month: true, year: true, userId: true },
  },
} satisfies Prisma.SalaryInfoSelect;

// ─────────────────────────────────────────────
// Financial Snapshot Select
// ─────────────────────────────────────────────
export const financialSnapshotSelect = {
  id: true,
  userId: true,
  period: true,
  startDate: true,
  endDate: true,
  totalIncome: true,
  totalExpense: true,
  totalSaving: true,
  totalInvestment: true,
  netBalance: true,
  savingRate: true,
  expenseRate: true,
  categoryBreakdown: true,
  weeklyBreakdown: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, email: true } },
} satisfies Prisma.FinancialSnapshotSelect;
