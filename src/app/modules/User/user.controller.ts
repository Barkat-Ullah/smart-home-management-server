import httpStatus from 'http-status';
import { userService } from './user.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

// create User
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUser(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

// get all User
const userFilterableFields = [
  'searchTerm',
  'id',
  'createdAt',
  'status',
  'role',
  'gender',
  'plan'
];
const getUserList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, userFilterableFields);
  const result = await userService.getUserList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// get User by id
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.getUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User details retrieved successfully',
    data: result,
  });
});

// get my User
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getMyUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My profile retrieved successfully',
    data: result,
  });
});

// update User
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

// toggle status User
const toggleStatusUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.toggleStatusUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status toggled successfully',
    data: result,
  });
});

// soft delete User
const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.softDeleteUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User soft deleted successfully',
    data: result,
  });
});

// hard delete User
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.deleteUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  getUserList,
  getUserById,
  getMyProfile,
  updateUser,
  toggleStatusUser,
  softDeleteUser,
  deleteUser,
};