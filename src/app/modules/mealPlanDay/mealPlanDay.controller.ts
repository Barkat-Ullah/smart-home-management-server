import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { mealPlanDayService } from './mealPlanDay.service';

const getMealPlanDayById = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayService.getMealPlanDayById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal plan day retrieved successfully',
    data: result,
  });
});

const getDaysByWeeklyPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayService.getDaysByWeeklyPlan(
    req.params.weeklyPlanId,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal plan days retrieved successfully',
    data: result,
  });
});

const updateMealPlanDay = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayService.updateMealPlanDay(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Meal plan day updated successfully',
    data: result,
  });
});

const markDayCooking = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayService.markDayCooking(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Day marked as cooking',
    data: result,
  });
});

const markDayCompleted = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayService.markDayCompleted(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Day marked as completed',
    data: result,
  });
});

const markDaySkipped = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayService.markDaySkipped(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Day marked as skipped',
    data: result,
  });
});

const assignCaregiver = catchAsync(async (req: Request, res: Response) => {
  const result = await mealPlanDayService.assignCaregiver(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Caregiver assigned successfully',
    data: result,
  });
});

export const mealPlanDayController = {
  getMealPlanDayById,
  getDaysByWeeklyPlan,
  updateMealPlanDay,
  markDayCooking,
  markDayCompleted,
  markDaySkipped,
  assignCaregiver,
};
