import { z } from 'zod';
import {
  TransactionType,
  TransactionCategory,
  BudgetPeriod,
  GoalStatus,
} from '@prisma/client';

// ─────────────────────────────────────────────
// Financial Profile
// ─────────────────────────────────────────────
const createFinancialProfileSchema = z.object({
  month: z.number({ required_error: 'Month is required' }).int().min(1).max(12),
  year: z
    .number({ required_error: 'Year is required' })
    .int()
    .min(2000)
    .max(2100),
  currency: z.string().default('BDT'),
  notes: z.string().optional(),
});

const updateFinancialProfileSchema = z.object({
  currency: z.string().optional(),
  notes: z.string().optional(),
  totalIncome: z.number().optional(),
  totalExpense: z.number().optional(),
  totalSaving: z.number().optional(),
  totalInvestment: z.number().optional(),
  netBalance: z.number().optional(),
});

// ─────────────────────────────────────────────
// Salary Info
// ─────────────────────────────────────────────
const createSalaryInfoSchema = z.object({
  financialProfileId: z.string({
    required_error: 'Financial profile ID is required',
  }),
  basicSalary: z
    .number({ required_error: 'Basic salary is required' })
    .positive(),
  houseRentAllowance: z.number().min(0).default(0),
  medicalAllowance: z.number().min(0).default(0),
  transportAllowance: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  otherAllowance: z.number().min(0).default(0),
  taxDeduction: z.number().min(0).default(0),
  providentFund: z.number().min(0).default(0),
  netSalary: z.number({ required_error: 'Net salary is required' }).positive(),
  salaryDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
});

const updateSalaryInfoSchema = z.object({
  basicSalary: z.number().positive().optional(),
  houseRentAllowance: z.number().min(0).optional(),
  medicalAllowance: z.number().min(0).optional(),
  transportAllowance: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  otherAllowance: z.number().min(0).optional(),
  taxDeduction: z.number().min(0).optional(),
  providentFund: z.number().min(0).optional(),
  netSalary: z.number().positive().optional(),
  salaryDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
});

// ─────────────────────────────────────────────
// Transaction
// ─────────────────────────────────────────────
const createTransactionSchema = z.object({
  financialProfileId: z.string({
    required_error: 'Financial profile ID is required',
  }),
  title: z.string({ required_error: 'Title is required' }).min(1).max(255),
  description: z.string().optional(),
  amount: z.number({ required_error: 'Amount is required' }).positive(),
  type: z.nativeEnum(TransactionType, { required_error: 'Type is required' }),
  category: z.nativeEnum(TransactionCategory, {
    required_error: 'Category is required',
  }),
  date: z
    .string({ required_error: 'Date is required' })
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().int().min(1).max(31).optional(),
  tags: z.array(z.string()).default([]),
});

const updateTransactionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  category: z.nativeEnum(TransactionCategory).optional(),
  date: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
  isRecurring: z.boolean().optional(),
  recurringDay: z.number().int().min(1).max(31).optional(),
  tags: z.array(z.string()).optional(),
});

// ─────────────────────────────────────────────
// Budget
// ─────────────────────────────────────────────
const createBudgetSchema = z.object({
  financialProfileId: z.string({
    required_error: 'Financial profile ID is required',
  }),
  category: z.nativeEnum(TransactionCategory, {
    required_error: 'Category is required',
  }),
  period: z.nativeEnum(BudgetPeriod).default('Monthly'),
  limitAmount: z
    .number({ required_error: 'Limit amount is required' })
    .positive(),
  alertThreshold: z.number().min(1).max(100).default(80),
  month: z.number().int().min(1).max(12, { message: 'Month must be 1–12' }),
  year: z.number().int().min(2000).max(2100),
});

const updateBudgetSchema = z.object({
  limitAmount: z.number().positive().optional(),
  alertThreshold: z.number().min(1).max(100).optional(),
  period: z.nativeEnum(BudgetPeriod).optional(),
  spentAmount: z.number().min(0).optional(),
  remainingAmount: z.number().min(0).optional(),
});

// ─────────────────────────────────────────────
// Financial Goal
// ─────────────────────────────────────────────
const createFinancialGoalSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1).max(255),
  description: z.string().optional(),
  targetAmount: z
    .number({ required_error: 'Target amount is required' })
    .positive(),
  savedAmount: z.number().min(0).default(0),
  startDate: z
    .string({ required_error: 'Start date is required' })
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  targetDate: z
    .string({ required_error: 'Target date is required' })
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  priority: z.number().int().min(1).default(1),
});

const updateFinancialGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  targetAmount: z.number().positive().optional(),
  savedAmount: z.number().min(0).optional(),
  remainingAmount: z.number().min(0).optional(),
  targetDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  achievedDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date' })
    .optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  priority: z.number().int().min(1).optional(),
});

export const financialValidation = {
  // Profile
  createFinancialProfileSchema,
  updateFinancialProfileSchema,
  // Salary
  createSalaryInfoSchema,
  updateSalaryInfoSchema,
  // Transaction
  createTransactionSchema,
  updateTransactionSchema,
  // Budget
  createBudgetSchema,
  updateBudgetSchema,
  // Goal
  createFinancialGoalSchema,
  updateFinancialGoalSchema,
};
