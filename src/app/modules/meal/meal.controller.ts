import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { mealService } from './meal.service';

const mealFilterableFields = ['searchTerm', 'createdAt'];

const createMeal = catchAsync(async (req: Request, res: Response) => {
  const result = await mealService.createMeal(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal created successfully',
    data: result,
  });
});

const getMealList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, mealFilterableFields);
  const result = await mealService.getMealList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getMyMeals = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, mealFilterableFields);
  const result = await mealService.getMyMeals(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My meals retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

const getMealById = catchAsync(async (req: Request, res: Response) => {
  const result = await mealService.getMealById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal retrieved successfully',
    data: result,
  });
});

const updateMeal = catchAsync(async (req: Request, res: Response) => {
  const result = await mealService.updateMeal(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal updated successfully',
    data: result,
  });
});

const deleteMeal = catchAsync(async (req: Request, res: Response) => {
  const result = await mealService.deleteMeal(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal deleted successfully',
    data: result,
  });
});

export const mealController = {
  createMeal,
  getMealList,
  getMyMeals,
  getMealById,
  updateMeal,
  deleteMeal,
};
