import httpStatus from 'http-status';
import { houseroomService } from './houseroom.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

const houseroomFilterableFields = [
  'searchTerm',
  'id',
  'type',
  'isDefault',
  'isDeleted',
  'createdAt',
];

// Create Houseroom
const createHouseroom = catchAsync(async (req: Request, res: Response) => {
  const result = await houseroomService.createHouseroom(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Houseroom created successfully',
    data: result,
  });
});

// Get all Houserooms (admin)
const getHouseroomList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, houseroomFilterableFields);
  const result = await houseroomService.getHouseroomList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houseroom list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get Houseroom by ID
const getHouseroomById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await houseroomService.getHouseroomById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houseroom details retrieved successfully',
    data: result,
  });
});

// Get MY Houserooms
const getMyHouseroom = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, houseroomFilterableFields);
  const result = await houseroomService.getMyHouseroom(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My houserooms retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Update Houseroom
const updateHouseroom = catchAsync(async (req: Request, res: Response) => {
  const result = await houseroomService.updateHouseroom(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houseroom updated successfully',
    data: result,
  });
});

// Soft Delete Houseroom
const softDeleteHouseroom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await houseroomService.softDeleteHouseroom(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houseroom soft deleted successfully',
    data: result,
  });
});

// Hard Delete Houseroom
const deleteHouseroom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await houseroomService.deleteHouseroom(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Houseroom permanently deleted',
    data: result,
  });
});

export const houseroomController = {
  createHouseroom,
  getHouseroomList,
  getHouseroomById,
  getMyHouseroom,
  updateHouseroom,
  softDeleteHouseroom,
  deleteHouseroom,
};
