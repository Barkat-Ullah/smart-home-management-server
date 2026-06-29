import httpStatus from 'http-status';
import { memoryService } from './memory.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

// create Memory
const createMemory = catchAsync(async (req: Request, res: Response) => {
  const result = await memoryService.createMemory(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Memory created successfully',
    data: result,
  });
});

// get all Memory
const memoryFilterableFields = ['searchTerm', 'id', 'createdAt', 'memoryOf'];
const getMemoryList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, memoryFilterableFields);
  const result = await memoryService.getMemoryList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// get Memory by id
const getMemoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await memoryService.getMemoryById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory details retrieved successfully',
    data: result,
  });
});

// get my Memory
const getMyMemory = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, memoryFilterableFields);
  const result = await memoryService.getMyMemory(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My Memory list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// update Memory
const updateMemory = catchAsync(async (req: Request, res: Response) => {
  const result = await memoryService.updateMemory(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory updated successfully',
    data: result,
  });
});

// toggle status Memory
const toggleStatusMemory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await memoryService.toggleStatusMemory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory status toggled successfully',
    data: result,
  });
});

// soft delete Memory
const softDeleteMemory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await memoryService.softDeleteMemory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory soft deleted successfully',
    data: result,
  });
});

// hard delete Memory
const deleteMemory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await memoryService.deleteMemory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Memory deleted successfully',
    data: result,
  });
});

export const memoryController = {
  createMemory,
  getMemoryList,
  getMemoryById,
  getMyMemory,
  updateMemory,
  toggleStatusMemory,
  softDeleteMemory,
  deleteMemory,
};
