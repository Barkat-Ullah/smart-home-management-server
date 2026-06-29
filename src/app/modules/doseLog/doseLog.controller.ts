import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { doseLogService } from './doseLog.service';

const doseLogFilterableFields = ['scheduleId', 'status', 'from', 'to'];

// -------------------------------------------------------
// log a dose
// -------------------------------------------------------
const logDose = catchAsync(async (req: Request, res: Response) => {
  const result = await doseLogService.logDose(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Dose logged successfully',
    data: result,
  });
});

// -------------------------------------------------------
// get all dose logs (admin)
// -------------------------------------------------------
const getDoseLogList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, doseLogFilterableFields);
  const result = await doseLogService.getDoseLogList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dose log list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// -------------------------------------------------------
// get my dose logs
// -------------------------------------------------------
const getMyDoseLogs = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, doseLogFilterableFields);
  const result = await doseLogService.getMyDoseLogs(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My dose logs retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// -------------------------------------------------------
// adherence report
// -------------------------------------------------------
const getAdherenceReport = catchAsync(async (req: Request, res: Response) => {
  const result = await doseLogService.getAdherenceReport(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Adherence report retrieved successfully',
    data: result,
  });
});

export const doseLogController = {
  logDose,
  getDoseLogList,
  getMyDoseLogs,
  getAdherenceReport,
};
