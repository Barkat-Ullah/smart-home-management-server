import httpStatus from 'http-status';
import { airConditionerService } from './airConditioner.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

const airConditionerFilterableFields = [
  'searchTerm',
  'id',
  'mode',
  'status',
  'isOn',
  'isDeleted',
  'houseroomId',
  'createdAt',
];

// Create
const createAirConditioner = catchAsync(async (req: Request, res: Response) => {
  const result = await airConditionerService.createAirConditioner(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Air conditioner created successfully',
    data: result,
  });
});

// Get all (admin)
const getAirConditionerList = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, airConditionerFilterableFields);
    const result = await airConditionerService.getAirConditionerList(
      options,
      filters,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Air conditioner list retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

// Get by ID
const getAirConditionerById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await airConditionerService.getAirConditionerById(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Air conditioner retrieved successfully',
      data: result,
    });
  },
);

// Get MY ACs
const getMyAirConditioner = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, airConditionerFilterableFields);
  const result = await airConditionerService.getMyAirConditioner(
    req,
    options,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My air conditioners retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get ACs by Room
const getAcsByRoom = catchAsync(async (req: Request, res: Response) => {
  const { houseroomId } = req.params;
  const result = await airConditionerService.getAcsByRoom(req, houseroomId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room air conditioners retrieved successfully',
    data: result,
  });
});

// Update
const updateAirConditioner = catchAsync(async (req: Request, res: Response) => {
  const result = await airConditionerService.updateAirConditioner(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Air conditioner updated successfully',
    data: result,
  });
});

// Control (temperature / mode / fanSpeed / isOn)
const controlAirConditioner = catchAsync(
  async (req: Request, res: Response) => {
    const result = await airConditionerService.controlAirConditioner(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Air conditioner controlled successfully',
      data: result,
    });
  },
);

// Toggle ON/OFF
const toggleAirConditioner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await airConditionerService.toggleAirConditioner(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `AC turned ${result.isOn ? 'ON' : 'OFF'} successfully`,
    data: result,
  });
});

// Soft delete
const softDeleteAirConditioner = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await airConditionerService.softDeleteAirConditioner(
      id,
      userId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Air conditioner soft deleted successfully',
      data: result,
    });
  },
);

// Hard delete
const deleteAirConditioner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await airConditionerService.deleteAirConditioner(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Air conditioner permanently deleted',
    data: result,
  });
});

export const airConditionerController = {
  createAirConditioner,
  getAirConditionerList,
  getAirConditionerById,
  getMyAirConditioner,
  getAcsByRoom,
  updateAirConditioner,
  controlAirConditioner,
  toggleAirConditioner,
  softDeleteAirConditioner,
  deleteAirConditioner,
};
