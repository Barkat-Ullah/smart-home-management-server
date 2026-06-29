import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { prescriptionService } from './prescription.service';

const prescriptionFilterableFields = [
  'searchTerm',
  'id',
  'createdAt',
  'userId',
];

// -------------------------------------------------------
// create Prescription
// -------------------------------------------------------
const createPrescription = catchAsync(async (req: Request, res: Response) => {
  const result = await prescriptionService.createPrescription(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Prescription created successfully',
    data: result,
  });
});

// -------------------------------------------------------
// get all Prescriptions (admin)
// -------------------------------------------------------
const getPrescriptionList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, prescriptionFilterableFields);
  const result = await prescriptionService.getPrescriptionList(
    options,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Prescription list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// -------------------------------------------------------
// get my Prescriptions
// -------------------------------------------------------
const getMyPrescriptions = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, prescriptionFilterableFields);
  const result = await prescriptionService.getMyPrescriptions(
    req,
    options,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My prescriptions retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// -------------------------------------------------------
// get Prescription by id
// -------------------------------------------------------
const getPrescriptionById = catchAsync(async (req: Request, res: Response) => {
  const result = await prescriptionService.getPrescriptionById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Prescription retrieved successfully',
    data: result,
  });
});

// -------------------------------------------------------
// update Prescription
// -------------------------------------------------------
const updatePrescription = catchAsync(async (req: Request, res: Response) => {
  const result = await prescriptionService.updatePrescription(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Prescription updated successfully',
    data: result,
  });
});

// -------------------------------------------------------
// delete Prescription
// -------------------------------------------------------
const deletePrescription = catchAsync(async (req: Request, res: Response) => {
  const result = await prescriptionService.deletePrescription(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Prescription deleted successfully',
    data: result,
  });
});

export const prescriptionController = {
  createPrescription,
  getPrescriptionList,
  getMyPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};
