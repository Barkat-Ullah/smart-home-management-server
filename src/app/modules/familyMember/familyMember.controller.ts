import httpStatus from 'http-status';
import { familyMemberService } from './familyMember.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

// create FamilyMember
const createFamilyMember = catchAsync(async (req: Request, res: Response) => {
  const result = await familyMemberService.createFamilyMember(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'FamilyMember created successfully',
    data: result,
  });
});

// get all FamilyMember
const familyMemberFilterableFields = [
  'searchTerm',
  'id',
  'createdAt',
  'status',
];
const getFamilyMemberList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, familyMemberFilterableFields);
  const result = await familyMemberService.getFamilyMemberList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FamilyMember list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// get FamilyMember by id
const getFamilyMemberById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await familyMemberService.getFamilyMemberById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FamilyMember details retrieved successfully',
    data: result,
  });
});

// get my FamilyMember
const getMyFamilyMember = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, familyMemberFilterableFields);
  const result = await familyMemberService.getMyFamilyMember(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My FamilyMember list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// update FamilyMember
const updateFamilyMember = catchAsync(async (req: Request, res: Response) => {
  const result = await familyMemberService.updateFamilyMember(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FamilyMember updated successfully',
    data: result,
  });
});

// toggle status FamilyMember
const toggleStatusFamilyMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await familyMemberService.toggleStatusFamilyMember(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FamilyMember status toggled successfully',
    data: result,
  });
});

// soft delete FamilyMember
const softDeleteFamilyMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await familyMemberService.softDeleteFamilyMember(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FamilyMember soft deleted successfully',
    data: result,
  });
});

// hard delete FamilyMember
const deleteFamilyMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await familyMemberService.deleteFamilyMember(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FamilyMember deleted successfully',
    data: result,
  });
});

export const familyMemberController = {
  createFamilyMember,
  getFamilyMemberList,
  getFamilyMemberById,
  getMyFamilyMember,
  updateFamilyMember,
  toggleStatusFamilyMember,
  softDeleteFamilyMember,
  deleteFamilyMember,
};