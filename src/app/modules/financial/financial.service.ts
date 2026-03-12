import httpStatus from 'http-status';
import { Prisma, GoalStatus } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import {
  financialProfileSelect,
  transactionSelect,
  budgetSelect,
  financialGoalSelect,
  salaryInfoSelect,
} from './financial.select';
import {
  buildFinancialFilterConditions,
  recalculateProfileTotals,
  recalculateBudgetSpend,
} from './financial.utils';

// ═══════════════════════════════════════════════════════════
// FINANCIAL PROFILE
// ═══════════════════════════════════════════════════════════

const createFinancialProfile = async (req: Request) => {
  const userId = req.user.id;
  const { month, year, currency, notes } = req.body;

  const existing = await prisma.financialProfile.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Financial profile for ${month}/${year} already exists`,
    );
  }

  const result = await prisma.financialProfile.create({
    data: { userId, month, year, currency: currency ?? 'BDT', notes },
    select: financialProfileSelect,
  });
  return result;
};

const getFinancialProfileList = async (
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.FinancialProfileWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [{ notes: { contains: searchTerm, mode: 'insensitive' } }],
    });
  }
  if (Object.keys(filterData).length) {
    andConditions.push(
      ...buildFinancialFilterConditions(filterData, 'profile'),
    );
  }

  const whereConditions = { AND: andConditions };
  const [result, total] = await Promise.all([
    prisma.financialProfile.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: financialProfileSelect,
    }),
    prisma.financialProfile.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getMyFinancialProfiles = async (
  req: Request,
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.FinancialProfileWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      notes: { contains: searchTerm, mode: 'insensitive' },
    });
  }
  if (Object.keys(filterData).length) {
    andConditions.push(
      ...buildFinancialFilterConditions(filterData, 'profile'),
    );
  }

  const whereConditions = { AND: andConditions };
  const [result, total] = await Promise.all([
    prisma.financialProfile.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: financialProfileSelect,
    }),
    prisma.financialProfile.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getFinancialProfileById = async (id: string) => {
  const result = await prisma.financialProfile.findUnique({
    where: { id },
    select: {
      ...financialProfileSelect,
      transactions: { where: { isDeleted: false }, select: transactionSelect },
      budgets: { select: budgetSelect },
      // goals: { where: { isDeleted: false }, select: financialGoalSelect },
    },
  });
  if (!result)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');
  if ((result as any).isDeleted)
    throw new ApiError(httpStatus.GONE, 'Financial profile deleted');
  return result;
};

const updateFinancialProfile = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.financialProfile.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');

  const result = await prisma.financialProfile.update({
    where: { id },
    data,
    select: financialProfileSelect,
  });
  return result;
};

const softDeleteFinancialProfile = async (id: string) => {
  const existing = await prisma.financialProfile.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');
  if ((existing as any).isDeleted)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already deleted');

  return prisma.financialProfile.update({
    where: { id },
    data: { isDeleted: true },
    select: financialProfileSelect,
  });
};

const deleteFinancialProfile = async (id: string) => {
  const existing = await prisma.financialProfile.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');
  return prisma.financialProfile.delete({ where: { id } });
};

// ═══════════════════════════════════════════════════════════
// SALARY INFO
// ═══════════════════════════════════════════════════════════

const createSalaryInfo = async (req: Request) => {
  const data = req.body;

  const profile = await prisma.financialProfile.findUnique({
    where: { id: data.financialProfileId },
  });
  if (!profile)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');

  const existing = await prisma.salaryInfo.findUnique({
    where: { financialProfileId: data.financialProfileId },
  });
  if (existing)
    throw new ApiError(
      httpStatus.CONFLICT,
      'Salary info already exists for this profile. Use update instead.',
    );

  const result = await prisma.salaryInfo.create({
    data,
    select: salaryInfoSelect,
  });

  // Add basic salary as Income transaction automatically
  await prisma.transaction.create({
    data: {
      userId: (profile as any).userId,
      financialProfileId: data.financialProfileId,
      title: 'Monthly Salary',
      amount: data.netSalary,
      type: 'Income',
      category: 'Salary',
      date: data.salaryDate ? new Date(data.salaryDate) : new Date(),
    },
  });

  await recalculateProfileTotals(prisma, data.financialProfileId);

  return result;
};

const getSalaryInfo = async (financialProfileId: string) => {
  const result = await prisma.salaryInfo.findUnique({
    where: { financialProfileId },
    select: salaryInfoSelect,
  });
  if (!result)
    throw new ApiError(httpStatus.NOT_FOUND, 'Salary info not found');
  return result;
};

const updateSalaryInfo = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.salaryInfo.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Salary info not found');

  const result = await prisma.salaryInfo.update({
    where: { id },
    data,
    select: salaryInfoSelect,
  });

  await recalculateProfileTotals(prisma, (existing as any).financialProfileId);
  return result;
};

const deleteSalaryInfo = async (id: string) => {
  const existing = await prisma.salaryInfo.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Salary info not found');
  return prisma.salaryInfo.delete({ where: { id } });
};

// ═══════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════

const createTransaction = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const profile = await prisma.financialProfile.findUnique({
    where: { id: data.financialProfileId },
  });
  if (!profile)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');

  const uploadedFiles = await handleFileUploads(files);

  const result = await prisma.transaction.create({
    data: {
      ...data,
      ...uploadedFiles,
      userId,
      date: new Date(data.date),
    },
    select: transactionSelect,
  });

  // Auto-recalculate profile totals
  await recalculateProfileTotals(prisma, data.financialProfileId);

  // Auto-recalculate budget if it's an expense
  if (data.type === 'Expense') {
    await recalculateBudgetSpend(
      prisma,
      data.financialProfileId,
      data.category,
    );
  }

  return result;
};

const getTransactionList = async (
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.TransactionWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }
  if (Object.keys(filterData).length) {
    andConditions.push(
      ...buildFinancialFilterConditions(filterData, 'transaction'),
    );
  }

  const whereConditions = { AND: andConditions };
  const [result, total] = await Promise.all([
    prisma.transaction.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { date: 'desc' },
      select: transactionSelect,
    }),
    prisma.transaction.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getMyTransactions = async (
  req: Request,
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.TransactionWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }
  if (Object.keys(filterData).length) {
    andConditions.push(
      ...buildFinancialFilterConditions(filterData, 'transaction'),
    );
  }

  const whereConditions = { AND: andConditions };
  const [result, total] = await Promise.all([
    prisma.transaction.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { date: 'desc' },
      select: transactionSelect,
    }),
    prisma.transaction.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getTransactionById = async (id: string) => {
  const result = await prisma.transaction.findUnique({
    where: { id },
    select: transactionSelect,
  });
  if (!result)
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  return result;
};

const updateTransaction = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  //   if ((existing as any).isDeleted)
  //     throw new ApiError(
  //       httpStatus.BAD_REQUEST,
  //       'Cannot update a deleted transaction',
  //     );

  const uploadedFiles = await handleFileUploads(files);

  const result = await prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      ...uploadedFiles,
      ...(data.date && { date: new Date(data.date) }),
    },
    select: transactionSelect,
  });

  await recalculateProfileTotals(prisma, (existing as any).financialProfileId);

  const categoryToCheck = data.category ?? (existing as any).category;
  const typeToCheck = data.type ?? (existing as any).type;
  if (typeToCheck === 'Expense') {
    await recalculateBudgetSpend(
      prisma,
      (existing as any).financialProfileId,
      categoryToCheck,
    );
  }

  return result;
};

const softDeleteTransaction = async (id: string) => {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  if ((existing as any).isDeleted)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction already deleted');

  const result = await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true },
    select: transactionSelect,
  });

  await recalculateProfileTotals(prisma, (existing as any).financialProfileId);
  if ((existing as any).type === 'Expense') {
    await recalculateBudgetSpend(
      prisma,
      (existing as any).financialProfileId,
      (existing as any).category,
    );
  }

  return result;
};

const deleteTransaction = async (id: string) => {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');

  const result = await prisma.transaction.delete({ where: { id } });
  await recalculateProfileTotals(prisma, (existing as any).financialProfileId);

  return result;
};

// ═══════════════════════════════════════════════════════════
// BUDGET
// ═══════════════════════════════════════════════════════════

const createBudget = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const profile = await prisma.financialProfile.findUnique({
    where: { id: data.financialProfileId },
  });
  if (!profile)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');

  // Unique: userId + category + month + year
  const existing = await prisma.budget.findUnique({
    where: {
      userId_category_month_year: {
        userId,
        category: data.category,
        month: data.month,
        year: data.year,
      },
    },
  });
  if (existing)
    throw new ApiError(
      httpStatus.CONFLICT,
      `Budget for ${data.category} in ${data.month}/${data.year} already exists`,
    );

  // Calculate current spend from existing transactions
  const spentAgg = await prisma.transaction.aggregate({
    where: {
      financialProfileId: data.financialProfileId,
      category: data.category,
      type: 'Expense',
      isDeleted: false,
    },
    _sum: { amount: true },
  });

  const spentAmount = spentAgg._sum.amount ?? 0;
  const remainingAmount = Math.max(data.limitAmount - spentAmount, 0);

  const result = await prisma.budget.create({
    data: {
      ...data,
      userId,
      spentAmount,
      remainingAmount,
    },
    select: budgetSelect,
  });

  return result;
};

const getBudgetList = async (
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.BudgetWhereInput[] = [];
  if (Object.keys(filterData).length) {
    andConditions.push(...buildFinancialFilterConditions(filterData, 'budget'));
  }

  const whereConditions = andConditions.length ? { AND: andConditions } : {};
  const [result, total] = await Promise.all([
    prisma.budget.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: budgetSelect,
    }),
    prisma.budget.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getMyBudgets = async (
  req: Request,
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.BudgetWhereInput[] = [{ userId }];
  if (Object.keys(filterData).length) {
    andConditions.push(...buildFinancialFilterConditions(filterData, 'budget'));
  }

  const whereConditions = { AND: andConditions };
  const [result, total] = await Promise.all([
    prisma.budget.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: budgetSelect,
    }),
    prisma.budget.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getBudgetById = async (id: string) => {
  const result = await prisma.budget.findUnique({
    where: { id },
    select: budgetSelect,
  });
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');
  return result;
};

const updateBudget = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');

  const newLimit = data.limitAmount ?? (existing as any).limitAmount;
  const spentAmount = (existing as any).spentAmount;
  const remainingAmount = Math.max(newLimit - spentAmount, 0);

  const result = await prisma.budget.update({
    where: { id },
    data: { ...data, remainingAmount },
    select: budgetSelect,
  });

  return result;
};

const deleteBudget = async (id: string) => {
  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Budget not found');
  return prisma.budget.delete({ where: { id } });
};

// ═══════════════════════════════════════════════════════════
// FINANCIAL GOALS
// ═══════════════════════════════════════════════════════════

const createFinancialGoal = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const result = await prisma.financialGoal.create({
    data: {
      userId,
      title: data.title,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount ?? 0,
      remainingAmount: data.targetAmount - (data.savedAmount ?? 0),
      startDate: new Date(data.startDate),
      targetDate: new Date(data.targetDate),
      priority: data.priority ?? 1,
    },
  });
  return result;
};

const getFinancialGoalList = async (
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.FinancialGoalWhereInput[] = [
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }
  if (Object.keys(filterData).length) {
    andConditions.push(...buildFinancialFilterConditions(filterData, 'goal'));
  }

  const whereConditions = { AND: andConditions };
  const [result, total] = await Promise.all([
    prisma.financialGoal.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { priority: 'asc' },
      select: financialGoalSelect,
    }),
    prisma.financialGoal.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getMyFinancialGoals = async (
  req: Request,
  options: IPaginationOptions,
  filters: Record<string, any>,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.FinancialGoalWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }
  if (Object.keys(filterData).length) {
    andConditions.push(...buildFinancialFilterConditions(filterData, 'goal'));
  }

  const whereConditions = { AND: andConditions };
  const [result, total] = await Promise.all([
    prisma.financialGoal.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { priority: 'asc' },
      select: financialGoalSelect,
    }),
    prisma.financialGoal.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

const getFinancialGoalById = async (id: string) => {
  const result = await prisma.financialGoal.findUnique({
    where: { id },
    select: financialGoalSelect,
  });
  if (!result)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial goal not found');
  return result;
};

const updateFinancialGoal = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.financialGoal.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial goal not found');
  //   if ((existing as any).isDeleted)
  //     throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a deleted goal');

  const targetAmount = data.targetAmount ?? (existing as any).targetAmount;
  const savedAmount = data.savedAmount ?? (existing as any).savedAmount;
  const remainingAmount = Math.max(targetAmount - savedAmount, 0);

  // Auto-mark as Achieved if fully saved
  const statusUpdate: Record<string, any> = {};
  if (remainingAmount === 0 && data.status !== GoalStatus.Failed) {
    statusUpdate.status = GoalStatus.Achieved;
    statusUpdate.achievedDate = new Date();
  }

  const result = await prisma.financialGoal.update({
    where: { id },
    data: {
      ...data,
      remainingAmount,
      ...statusUpdate,
      ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
      ...(data.achievedDate && { achievedDate: new Date(data.achievedDate) }),
    },
    select: financialGoalSelect,
  });

  return result;
};

const softDeleteFinancialGoal = async (id: string) => {
  const existing = await prisma.financialGoal.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial goal not found');
  if ((existing as any).isDeleted)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Goal already deleted');

  return prisma.financialGoal.update({
    where: { id },
    data: { isDeleted: true },
    select: financialGoalSelect,
  });
};

const deleteFinancialGoal = async (id: string) => {
  const existing = await prisma.financialGoal.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, 'Financial goal not found');
  return prisma.financialGoal.delete({ where: { id } });
};

// ═══════════════════════════════════════════════════════════
// FINANCIAL SNAPSHOT (analytics)
// ═══════════════════════════════════════════════════════════

const getMySnapshot = async (req: Request) => {
  const userId = req.user.id;
  const { period, month, year } = req.query as Record<string, string>;

  // Build date range based on period
  const now = new Date();
  const y = parseInt(year) || now.getFullYear();
  const m = parseInt(month) || now.getMonth() + 1;

  let startDate: Date;
  let endDate: Date;

  if (period === 'Weekly') {
    const day = now.getUTCDay();
    startDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - day,
        0,
        0,
        0,
        0,
      ),
    );
    endDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - day + 6,
        23,
        59,
        59,
        999,
      ),
    );
  } else if (period === 'Yearly') {
    startDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
    endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
  } else {
    // Monthly
    startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  }
  // Aggregate transactions in range
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      isDeleted: false,
      date: { gte: startDate, lte: endDate },
    },
    select: { type: true, category: true, amount: true, date: true },
  });

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((s, t) => s + t.amount, 0);
  const totalSaving = transactions
    .filter(t => t.type === 'Saving')
    .reduce((s, t) => s + t.amount, 0);
  const totalInvestment = transactions
    .filter(t => t.type === 'Investment')
    .reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? (totalSaving / totalIncome) * 100 : 0;
  const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  transactions.forEach(t => {
    categoryBreakdown[t.category] =
      (categoryBreakdown[t.category] ?? 0) + t.amount;
  });

  // Weekly breakdown (for monthly view)
  const weeklyBreakdown: Record<string, number>[] = [];
  if (period !== 'Weekly') {
    for (let week = 0; week < 5; week++) {
      const wStart = new Date(startDate);
      wStart.setDate(wStart.getDate() + week * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);

      const weekTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= wStart && d <= wEnd;
      });

      weeklyBreakdown.push({
        week: week + 1,
        income: weekTxns
          .filter(t => t.type === 'Income')
          .reduce((s, t) => s + t.amount, 0),
        expense: weekTxns
          .filter(t => t.type === 'Expense')
          .reduce((s, t) => s + t.amount, 0),
      });
    }
  }

  return {
    period: period ?? 'Monthly',
    startDate,
    endDate,
    totalIncome,
    totalExpense,
    totalSaving,
    totalInvestment,
    netBalance,
    savingRate: parseFloat(savingRate.toFixed(2)),
    expenseRate: parseFloat(expenseRate.toFixed(2)),
    categoryBreakdown,
    weeklyBreakdown,
  };
};

export const financialService = {
  // Profile
  createFinancialProfile,
  getFinancialProfileList,
  getMyFinancialProfiles,
  getFinancialProfileById,
  updateFinancialProfile,
  softDeleteFinancialProfile,
  deleteFinancialProfile,
  // Salary
  createSalaryInfo,
  getSalaryInfo,
  updateSalaryInfo,
  deleteSalaryInfo,
  // Transaction
  createTransaction,
  getTransactionList,
  getMyTransactions,
  getTransactionById,
  updateTransaction,
  softDeleteTransaction,
  deleteTransaction,
  // Budget
  createBudget,
  getBudgetList,
  getMyBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  // Goals
  createFinancialGoal,
  getFinancialGoalList,
  getMyFinancialGoals,
  getFinancialGoalById,
  updateFinancialGoal,
  softDeleteFinancialGoal,
  deleteFinancialGoal,
  // Snapshot
  getMySnapshot,
};
