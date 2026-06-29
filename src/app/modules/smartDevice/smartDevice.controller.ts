import httpStatus from 'http-status';
import { smartDeviceService } from './smartDevice.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

const smartDeviceFilterableFields = [
  'searchTerm',
  'id',
  'type',
  'status',
  'isOn',
  'isDeleted',
  'houseroomId',
  'createdAt',
];

// Create
const createSmartDevice = catchAsync(async (req: Request, res: Response) => {
  const result = await smartDeviceService.createSmartDevice(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Smart device created successfully',
    data: result,
  });
});

// Get all (admin)
const getSmartDeviceList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, smartDeviceFilterableFields);
  const result = await smartDeviceService.getSmartDeviceList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Smart device list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// Get by ID
const getSmartDeviceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await smartDeviceService.getSmartDeviceById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Smart device retrieved successfully',
    data: result,
  });
});

// Get MY devices
const getMySmartDevice = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, smartDeviceFilterableFields);
  const result = await smartDeviceService.getMySmartDevice(
    req,
    options,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My smart devices retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// Get devices by room
const getDevicesByRoom = catchAsync(async (req: Request, res: Response) => {
  const { houseroomId } = req.params;
  const result = await smartDeviceService.getDevicesByRoom(req, houseroomId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room devices retrieved successfully',
    data: result,
  });
});

// Update
const updateSmartDevice = catchAsync(async (req: Request, res: Response) => {
  const result = await smartDeviceService.updateSmartDevice(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Smart device updated successfully',
    data: result,
  });
});

// Toggle ON/OFF
const toggleSmartDevice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await smartDeviceService.toggleSmartDevice(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Device turned ${result.isOn ? 'ON' : 'OFF'} successfully`,
    data: result,
  });
});

// Soft delete
const softDeleteSmartDevice = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await smartDeviceService.softDeleteSmartDevice(id, userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Smart device soft deleted successfully',
      data: result,
    });
  },
);

// Hard delete
const deleteSmartDevice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await smartDeviceService.deleteSmartDevice(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Smart device permanently deleted',
    data: result,
  });
});

export const smartDeviceController = {
  createSmartDevice,
  getSmartDeviceList,
  getSmartDeviceById,
  getMySmartDevice,
  getDevicesByRoom,
  updateSmartDevice,
  toggleSmartDevice,
  softDeleteSmartDevice,
  deleteSmartDevice,
};
