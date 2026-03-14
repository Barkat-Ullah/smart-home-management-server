import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { weeklyMealPlanController } from './weeklyMealPlan.controller';
import { weeklyMealPlanValidation } from './weeklyMealPlan.validation';

const router = express.Router();

// NOTE: /current and /my must be before /:id
router.get('/current', auth(), weeklyMealPlanController.getCurrentWeekPlan);
router.get('/my', auth(), weeklyMealPlanController.getMyWeeklyMealPlans);

router.post(
  '/',
  auth(),
  validateRequest(weeklyMealPlanValidation.createSchema),
  weeklyMealPlanController.createWeeklyMealPlan,
);

router.get('/', auth(), weeklyMealPlanController.getWeeklyMealPlanList);

router.get('/:id', auth(), weeklyMealPlanController.getWeeklyMealPlanById);

router.put(
  '/:id',
  auth(),
  validateRequest(weeklyMealPlanValidation.updateSchema),
  weeklyMealPlanController.updateWeeklyMealPlan,
);

router.delete('/:id', auth(), weeklyMealPlanController.deleteWeeklyMealPlan);

export const weeklyMealPlanRoutes = router;
