import httpStatus from 'http-status';
import { childService } from './child.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

// create Child
const createChild = catchAsync(async (req: Request, res: Response) => {
  const result = await childService.createChild(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Child created successfully',
    data: result,
  });
});

// get all Child
const childFilterableFields = [
  'searchTerm',
  'id',
  'createdAt',
  'status',
];
const getChildList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, childFilterableFields);
  const result = await childService.getChildList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Child list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// get Child by id
const getChildById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await childService.getChildById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Child details retrieved successfully',
    data: result,
  });
});

// get my Child
const getMyChild = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, childFilterableFields);
  const result = await childService.getMyChild(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My Child list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// update Child
const updateChild = catchAsync(async (req: Request, res: Response) => {
  const result = await childService.updateChild(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Child updated successfully',
    data: result,
  });
});

// toggle status Child
const toggleStatusChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await childService.toggleStatusChild(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Child status toggled successfully',
    data: result,
  });
});

// soft delete Child
const softDeleteChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await childService.softDeleteChild(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Child soft deleted successfully',
    data: result,
  });
});

// hard delete Child
const deleteChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await childService.deleteChild(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Child deleted successfully',
    data: result,
  });
});

export const childController = {
  createChild,
  getChildList,
  getChildById,
  getMyChild,
  updateChild,
  toggleStatusChild,
  softDeleteChild,
  deleteChild,
};