import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploader } from '../../utils/fileUploader';
import { mealController } from './meal.controller';
import { mealValidation } from './meal.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  fileUploader.upload.fields([{ name: 'files', maxCount: 1 }]),
  validateRequest(mealValidation.createSchema),
  mealController.createMeal,
);

router.get('/', auth(), mealController.getMealList);

router.get('/my', auth(), mealController.getMyMeals);

router.get('/:id', auth(), mealController.getMealById);

router.put(
  '/:id',
  auth(),
  fileUploader.upload.fields([{ name: 'files', maxCount: 1 }]),
  validateRequest(mealValidation.updateSchema),
  mealController.updateMeal,
);

router.delete('/:id', auth(), mealController.deleteMeal);

export const mealRoutes = router;
