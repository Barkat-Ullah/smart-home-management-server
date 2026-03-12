import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { ScheduleStatus } from '@prisma/client';
import { medicineScheduleService } from './medicineSchedule.service';

const scheduleFilterableFields = [
  'searchTerm',
  'status',
  'medicineForm',
  'frequencyType',
  'prescriptionId',
  'createdAt',
];

// -------------------------------------------------------
// create MedicineSchedule
// -------------------------------------------------------
const createMedicineSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const result = await medicineScheduleService.createMedicineSchedule(req);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Medicine schedule created successfully',
      data: result,
    });
  },
);

// -------------------------------------------------------
// get all MedicineSchedules (admin)
// -------------------------------------------------------
const getMedicineScheduleList = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, scheduleFilterableFields);
    const result = await medicineScheduleService.getMedicineScheduleList(
      options,
      filters,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Medicine schedule list retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

// -------------------------------------------------------
// get my MedicineSchedules
// -------------------------------------------------------
const getMyMedicineSchedules = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, scheduleFilterableFields);
    const result = await medicineScheduleService.getMyMedicineSchedules(
      req,
      options,
      filters,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My medicine schedules retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

// -------------------------------------------------------
// get today's schedules
// -------------------------------------------------------
const getTodaySchedules = catchAsync(async (req: Request, res: Response) => {
  const result = await medicineScheduleService.getTodaySchedules(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Today's medicine schedules retrieved successfully",
    data: result,
  });
});

// -------------------------------------------------------
// get MedicineSchedule by id
// -------------------------------------------------------
const getMedicineScheduleById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await medicineScheduleService.getMedicineScheduleById(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Medicine schedule retrieved successfully',
      data: result,
    });
  },
);

// -------------------------------------------------------
// update MedicineSchedule
// -------------------------------------------------------
const updateMedicineSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const result = await medicineScheduleService.updateMedicineSchedule(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Medicine schedule updated successfully',
      data: result,
    });
  },
);

// -------------------------------------------------------
// pause schedule
// -------------------------------------------------------
const pauseSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await medicineScheduleService.updateScheduleStatus(
    req.params.id,
    req.user.id,
    ScheduleStatus.Paused,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Medicine schedule paused successfully',
    data: result,
  });
});

// -------------------------------------------------------
// resume schedule
// -------------------------------------------------------
const resumeSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await medicineScheduleService.updateScheduleStatus(
    req.params.id,
    req.user.id,
    ScheduleStatus.Active,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Medicine schedule resumed successfully',
    data: result,
  });
});

// -------------------------------------------------------
// complete schedule
// -------------------------------------------------------
const completeSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await medicineScheduleService.updateScheduleStatus(
    req.params.id,
    req.user.id,
    ScheduleStatus.Completed,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Medicine schedule marked as completed',
    data: result,
  });
});

// -------------------------------------------------------
// delete MedicineSchedule (soft)
// -------------------------------------------------------
const deleteMedicineSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const result = await medicineScheduleService.deleteMedicineSchedule(
      req.params.id,
      req.user.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Medicine schedule deleted successfully',
      data: result,
    });
  },
);

export const medicineScheduleController = {
  createMedicineSchedule,
  getMedicineScheduleList,
  getMyMedicineSchedules,
  getTodaySchedules,
  getMedicineScheduleById,
  updateMedicineSchedule,
  pauseSchedule,
  resumeSchedule,
  completeSchedule,
  deleteMedicineSchedule,
};
