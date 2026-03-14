import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { mealPlanDayItemController } from './mealPlanDayItem.controller';
import { mealPlanDayItemValidation } from './mealPlanDayItem.validation';

const router = express.Router();

// NOTE: /by-day/:planDayId must be before /:id
router.get(
  '/by-day/:planDayId',
  auth(),
  mealPlanDayItemController.getItemsByPlanDay,
);

// POST /meal-items — add a meal to a specific day slot
router.post(
  '/',
  auth(),
  validateRequest(mealPlanDayItemValidation.createSchema),
  mealPlanDayItemController.addMealItem,
);

// GET /meal-items/:id
router.get('/:id', auth(), mealPlanDayItemController.getMealItemById);

// PUT /meal-items/:id — update item details
router.put(
  '/:id',
  auth(),
  validateRequest(mealPlanDayItemValidation.updateSchema),
  mealPlanDayItemController.updateMealItem,
);

// PATCH /meal-items/:id/complete — tick off a single meal
router.patch(
  '/:id/complete',
  auth(),
  mealPlanDayItemController.completeMealItem,
);

// DELETE /meal-items/:id — remove from the day
router.delete('/:id', auth(), mealPlanDayItemController.deleteMealItem);

export const mealPlanDayItemRoutes = router;
