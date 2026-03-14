import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { mealPlanDayController } from './mealPlanDay.controller';
import { mealPlanDayValidation } from './mealPlanDay.validation';

const router = express.Router();

// GET /plan-days/by-plan/:weeklyPlanId — all 7 days of a plan
router.get(
  '/by-plan/:weeklyPlanId',
  auth(),
  mealPlanDayController.getDaysByWeeklyPlan,
);

// GET /plan-days/:id — single day with all meal items
router.get('/:id', auth(), mealPlanDayController.getMealPlanDayById);

// PUT /plan-days/:id — update notes / status / caregiverId
router.put(
  '/:id',
  auth(),
  validateRequest(mealPlanDayValidation.updateSchema),
  mealPlanDayController.updateMealPlanDay,
);

// PATCH /plan-days/:id/cooking
router.patch('/:id/cooking', auth(), mealPlanDayController.markDayCooking);

// PATCH /plan-days/:id/complete — marks day + all items as completed
router.patch('/:id/complete', auth(), mealPlanDayController.markDayCompleted);

// PATCH /plan-days/:id/skip
router.patch('/:id/skip', auth(), mealPlanDayController.markDaySkipped);

// PATCH /plan-days/:id/caregiver — assign caregiver
router.patch('/:id/caregiver', auth(), mealPlanDayController.assignCaregiver);

export const mealPlanDayRoutes = router;
