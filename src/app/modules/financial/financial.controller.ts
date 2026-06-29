import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { financialService } from './financial.service';

// ─── Filterable fields per entity ────────────────────────
const profileFilterableFields = ['searchTerm', 'month', 'year', 'currency'];
const transactionFilterableFields = [
  'searchTerm',
  'financialProfileId',
  'type',
  'category',
  'date',
  'isRecurring',
  'amount_gte',
  'amount_lte',
  'createdAt',
];
const budgetFilterableFields = [
  'financialProfileId',
  'category',
  'period',
  'month',
  'year',
  'isAlertSent',
];
const goalFilterableFields = [
  'searchTerm',
  'financialProfileId',
  'status',
  'startDate',
  'targetDate',
];

// ═══════════════════════════════════════════════════════════
// FINANCIAL PROFILE
// ═══════════════════════════════════════════════════════════

const createFinancialProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await financialService.createFinancialProfile(req);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Financial profile created successfully',
      data: result,
    });
  },
);

const getFinancialProfileList = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, profileFilterableFields);
    const result = await financialService.getFinancialProfileList(
      options,
      filters,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Financial profile list retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

const getMyFinancialProfiles = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, profileFilterableFields);
    const result = await financialService.getMyFinancialProfiles(
      req,
      options,
      filters,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My financial profiles retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

const getFinancialProfileById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await financialService.getFinancialProfileById(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Financial profile retrieved successfully',
      data: result,
    });
  },
);

const updateFinancialProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await financialService.updateFinancialProfile(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Financial profile updated successfully',
      data: result,
    });
  },
);

const softDeleteFinancialProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await financialService.softDeleteFinancialProfile(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Financial profile deleted successfully',
      data: result,
    });
  },
);

const deleteFinancialProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await financialService.deleteFinancialProfile(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Financial profile permanently deleted',
      data: result,
    });
  },
);

// ═══════════════════════════════════════════════════════════
// SALARY INFO
// ═══════════════════════════════════════════════════════════

const createSalaryInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.createSalaryInfo(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Salary info created successfully',
    data: result,
  });
});

const getSalaryInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.getSalaryInfo(
    req.params.financialProfileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Salary info retrieved successfully',
    data: result,
  });
});

const updateSalaryInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.updateSalaryInfo(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Salary info updated successfully',
    data: result,
  });
});

const deleteSalaryInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.deleteSalaryInfo(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Salary info deleted successfully',
    data: result,
  });
});

// ═══════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════

const createTransaction = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.createTransaction(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Transaction created successfully',
    data: result,
  });
});

const getTransactionList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, transactionFilterableFields);
  const result = await financialService.getTransactionList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, transactionFilterableFields);
  const result = await financialService.getMyTransactions(
    req,
    options,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My transactions retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getTransactionById = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.getTransactionById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: result,
  });
});

const updateTransaction = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.updateTransaction(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction updated successfully',
    data: result,
  });
});

const softDeleteTransaction = catchAsync(
  async (req: Request, res: Response) => {
    const result = await financialService.softDeleteTransaction(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Transaction deleted successfully',
      data: result,
    });
  },
);

const deleteTransaction = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.deleteTransaction(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction permanently deleted',
    data: result,
  });
});

// ═══════════════════════════════════════════════════════════
// BUDGET
// ═══════════════════════════════════════════════════════════

const createBudget = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.createBudget(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Budget created successfully',
    data: result,
  });
});

const getBudgetList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, budgetFilterableFields);
  const result = await financialService.getBudgetList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getMyBudgets = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, budgetFilterableFields);
  const result = await financialService.getMyBudgets(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My budgets retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getBudgetById = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.getBudgetById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget retrieved successfully',
    data: result,
  });
});

const updateBudget = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.updateBudget(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget updated successfully',
    data: result,
  });
});

const deleteBudget = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.deleteBudget(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Budget deleted successfully',
    data: result,
  });
});

// ═══════════════════════════════════════════════════════════
// FINANCIAL GOALS
// ═══════════════════════════════════════════════════════════

const createFinancialGoal = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.createFinancialGoal(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Financial goal created successfully',
    data: result,
  });
});

const getFinancialGoalList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, goalFilterableFields);
  const result = await financialService.getFinancialGoalList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Financial goal list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getMyFinancialGoals = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, goalFilterableFields);
  const result = await financialService.getMyFinancialGoals(
    req,
    options,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My financial goals retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getFinancialGoalById = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.getFinancialGoalById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Financial goal retrieved successfully',
    data: result,
  });
});

const updateFinancialGoal = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.updateFinancialGoal(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Financial goal updated successfully',
    data: result,
  });
});

const softDeleteFinancialGoal = catchAsync(
  async (req: Request, res: Response) => {
    const result = await financialService.softDeleteFinancialGoal(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Financial goal deleted successfully',
      data: result,
    });
  },
);

const deleteFinancialGoal = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.deleteFinancialGoal(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Financial goal permanently deleted',
    data: result,
  });
});

// ═══════════════════════════════════════════════════════════
// SNAPSHOT / ANALYTICS
// ═══════════════════════════════════════════════════════════

const getMySnapshot = catchAsync(async (req: Request, res: Response) => {
  const result = await financialService.getMySnapshot(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Financial snapshot retrieved successfully',
    data: result,
  });
});

export const financialController = {
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
