import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { mealPlanDayItemService } from './mealPlanDayItem.service';

const addMealItem = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayItemService.addMealItem(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Meal item added successfully',
    data: result,
  });
});

const getMealItemById = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayItemService.getMealItemById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal item retrieved successfully',
    data: result,
  });
});

const getItemsByPlanDay = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayItemService.getItemsByPlanDay(
    req.params.planDayId,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal items retrieved successfully',
    data: result,
  });
});

const updateMealItem = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayItemService.updateMealItem(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal item updated successfully',
    data: result,
  });
});

const completeMealItem = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayItemService.completeMealItem(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal item marked as completed',
    data: result,
  });
});

const deleteMealItem = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayItemService.deleteMealItem(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal item deleted successfully',
    data: result,
  });
});

export const mealPlanDayItemController = {
  addMealItem,
  getMealItemById,
  getItemsByPlanDay,
  updateMealItem,
  completeMealItem,
  deleteMealItem,
};
