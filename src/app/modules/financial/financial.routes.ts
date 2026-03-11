import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { financialController } from './financial.controller';
import { financialValidation } from './financial.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();

const fileUpload = fileUploader.upload.fields([
  { name: 'files', maxCount: 5 },
  { name: 'receipt', maxCount: 1 },
]);

// ════════════════════════════════════════════════════════
// FINANCIAL PROFILE  →  /api/v1/financial/profiles
// ════════════════════════════════════════════════════════
router.post(
  '/profiles',
  auth(),
  validateRequest(financialValidation.createFinancialProfileSchema),
  financialController.createFinancialProfile,
);
router.get('/profiles', auth(), financialController.getFinancialProfileList);
router.get('/profiles/my', auth(), financialController.getMyFinancialProfiles);
router.get(
  '/profiles/:id',
  auth(),
  financialController.getFinancialProfileById,
);
router.put(
  '/profiles/:id',
  auth(),
  validateRequest(financialValidation.updateFinancialProfileSchema),
  financialController.updateFinancialProfile,
);
router.patch(
  '/profiles/soft-delete/:id',
  auth(),
  financialController.softDeleteFinancialProfile,
);
router.delete(
  '/profiles/:id',
  auth(),
  financialController.deleteFinancialProfile,
);

// ════════════════════════════════════════════════════════
// SALARY INFO  →  /api/v1/financial/salary
// ════════════════════════════════════════════════════════
router.post(
  '/salary',
  auth(),
  validateRequest(financialValidation.createSalaryInfoSchema),
  financialController.createSalaryInfo,
);
router.get(
  '/salary/:financialProfileId',
  auth(),
  financialController.getSalaryInfo,
);
router.put(
  '/salary/:id',
  auth(),
  validateRequest(financialValidation.updateSalaryInfoSchema),
  financialController.updateSalaryInfo,
);
router.delete('/salary/:id', auth(), financialController.deleteSalaryInfo);

// ════════════════════════════════════════════════════════
// TRANSACTIONS  →  /api/v1/financial/transactions
// ════════════════════════════════════════════════════════
router.post(
  '/transactions',
  auth(),
  fileUpload,
  validateRequest(financialValidation.createTransactionSchema),
  financialController.createTransaction,
);
router.get('/transactions', auth(), financialController.getTransactionList);
router.get('/transactions/my', auth(), financialController.getMyTransactions);
router.get('/transactions/:id', auth(), financialController.getTransactionById);
router.put(
  '/transactions/:id',
  auth(),
  fileUpload,
  validateRequest(financialValidation.updateTransactionSchema),
  financialController.updateTransaction,
);
router.patch(
  '/transactions/soft-delete/:id',
  auth(),
  financialController.softDeleteTransaction,
);
router.delete(
  '/transactions/:id',
  auth(),
  financialController.deleteTransaction,
);

// ════════════════════════════════════════════════════════
// BUDGET  →  /api/v1/financial/budgets
// ════════════════════════════════════════════════════════
router.post(
  '/budgets',
  auth(),
  validateRequest(financialValidation.createBudgetSchema),
  financialController.createBudget,
);
router.get('/budgets', auth(), financialController.getBudgetList);
router.get('/budgets/my', auth(), financialController.getMyBudgets);
router.get('/budgets/:id', auth(), financialController.getBudgetById);
router.put(
  '/budgets/:id',
  auth(),
  validateRequest(financialValidation.updateBudgetSchema),
  financialController.updateBudget,
);
router.delete('/budgets/:id', auth(), financialController.deleteBudget);

// ════════════════════════════════════════════════════════
// FINANCIAL GOALS  →  /api/v1/financial/goals
// ════════════════════════════════════════════════════════
router.post(
  '/goals',
  auth(),
  validateRequest(financialValidation.createFinancialGoalSchema),
  financialController.createFinancialGoal,
);
router.get('/goals', auth(), financialController.getFinancialGoalList);
router.get('/goals/my', auth(), financialController.getMyFinancialGoals);
router.get('/goals/:id', auth(), financialController.getFinancialGoalById);
router.put(
  '/goals/:id',
  auth(),
  validateRequest(financialValidation.updateFinancialGoalSchema),
  financialController.updateFinancialGoal,
);
router.patch(
  '/goals/soft-delete/:id',
  auth(),
  financialController.softDeleteFinancialGoal,
);
router.delete('/goals/:id', auth(), financialController.deleteFinancialGoal);

// ════════════════════════════════════════════════════════
// SNAPSHOT / ANALYTICS  →  /api/v1/financial/snapshot
// ════════════════════════════════════════════════════════
router.get('/snapshot/my', auth(), financialController.getMySnapshot);

export const financialRoutes = router;
