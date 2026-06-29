import httpStatus from 'http-status';
import { cctvCameraService } from './cctvCamera.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

const cctvCameraFilterableFields = [
  'searchTerm',
  'id',
  'status',
  'isDeleted',
  'houseroomId',
  'createdAt',
];

// Create
const createCctvCamera = catchAsync(async (req: Request, res: Response) => {
  const result = await cctvCameraService.createCctvCamera(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Camera created successfully',
    data: result,
  });
});

// Get all (admin)
const getCctvCameraList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, cctvCameraFilterableFields);
  const result = await cctvCameraService.getCctvCameraList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Camera list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// Get by ID
const getCctvCameraById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await cctvCameraService.getCctvCameraById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Camera retrieved successfully',
    data: result,
  });
});

// Get stream URL + credentials (owner only)
const getCameraStream = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await cctvCameraService.getCameraStream(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Camera stream info retrieved successfully',
    data: result,
  });
});

// Get MY cameras
const getMyCctvCamera = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, cctvCameraFilterableFields);
  const result = await cctvCameraService.getMyCctvCamera(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My cameras retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// Get cameras by room
const getCamerasByRoom = catchAsync(async (req: Request, res: Response) => {
  const { houseroomId } = req.params;
  const result = await cctvCameraService.getCamerasByRoom(req, houseroomId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room cameras retrieved successfully',
    data: result,
  });
});

// Update
const updateCctvCamera = catchAsync(async (req: Request, res: Response) => {
  const result = await cctvCameraService.updateCctvCamera(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Camera updated successfully',
    data: result,
  });
});

// Toggle Online/Offline
const toggleStatusCctvCamera = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await cctvCameraService.toggleStatusCctvCamera(id, userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Camera is now ${result.status}`,
      data: result,
    });
  },
);

// Soft delete
const softDeleteCctvCamera = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await cctvCameraService.softDeleteCctvCamera(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Camera soft deleted successfully',
    data: result,
  });
});

// Hard delete
const deleteCctvCamera = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await cctvCameraService.deleteCctvCamera(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Camera permanently deleted',
    data: result,
  });
});

export const cctvCameraController = {
  createCctvCamera,
  getCctvCameraList,
  getCctvCameraById,
  getCameraStream,
  getMyCctvCamera,
  getCamerasByRoom,
  updateCctvCamera,
  toggleStatusCctvCamera,
  softDeleteCctvCamera,
  deleteCctvCamera,
};
