import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { weeklyMealPlanService } from './weeklyMealPlan.service';

const weeklyPlanFilterableFields = ['status', 'createdAt'];

const createWeeklyMealPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await weeklyMealPlanService.createWeeklyMealPlan(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Weekly meal plan created successfully',
    data: result,
  });
});

const getWeeklyMealPlanList = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, weeklyPlanFilterableFields);
    const result = await weeklyMealPlanService.getWeeklyMealPlanList(
      options,
      filters,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Weekly meal plan list retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

const getMyWeeklyMealPlans = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, weeklyPlanFilterableFields);
  const result = await weeklyMealPlanService.getMyWeeklyMealPlans(
    req,
    options,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My weekly meal plans retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// GET /weekly-plans/current — this week's plan
const getCurrentWeekPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await weeklyMealPlanService.getCurrentWeekPlan(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Current week meal plan retrieved successfully',
    data: result,
  });
});

const getWeeklyMealPlanById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await weeklyMealPlanService.getWeeklyMealPlanById(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Weekly meal plan retrieved successfully',
      data: result,
    });
  },
);

const updateWeeklyMealPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await weeklyMealPlanService.updateWeeklyMealPlan(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Weekly meal plan updated successfully',
    data: result,
  });
});

const deleteWeeklyMealPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await weeklyMealPlanService.deleteWeeklyMealPlan(
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Weekly meal plan deleted successfully',
    data: result,
  });
});

export const weeklyMealPlanController = {
  createWeeklyMealPlan,
  getWeeklyMealPlanList,
  getMyWeeklyMealPlans,
  getCurrentWeekPlan,
  getWeeklyMealPlanById,
  updateWeeklyMealPlan,
  deleteWeeklyMealPlan,
};
