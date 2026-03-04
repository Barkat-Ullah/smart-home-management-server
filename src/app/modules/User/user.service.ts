import httpStatus from 'http-status';
import { Prisma, UserRoleEnum } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { userSelect } from './user.select';

// -------------------------------------------------------
// create User
// -------------------------------------------------------
const createUser = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const addedData = { ...data, ...uploadedFiles, userId };
  const result = await prisma.user.create({
    data: addedData,
    select: userSelect,
  });
  return result;
};

// -------------------------------------------------------
// get all User
// -------------------------------------------------------
type IUserFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  status?: string;
  role?: string;
};

const userSearchAbleFields = ['fullName', 'email'];

const getUserList = async (
  options: IPaginationOptions,
  filters: IUserFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.UserWhereInput[] = [{ role: UserRoleEnum.USER }];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    Object.keys(filterData).forEach(key => {
      const value = (filterData as any)[key];
      if (value === '' || value === null || value === undefined) return;

      if (key === 'createdAt' && value) {
        const parts = (value as string).split('-');
        if (parts.length === 2) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const start = new Date(year, month, 1, 0, 0, 0, 0);
          const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
          andConditions.push({
            createdAt: { gte: start.toISOString(), lte: end.toISOString() },
          });
        } else {
          const start = new Date(value);
          start.setHours(0, 0, 0, 0);
          const end = new Date(value);
          end.setHours(23, 59, 59, 999);
          andConditions.push({
            createdAt: { gte: start.toISOString(), lte: end.toISOString() },
          });
        }
        return;
      }

      if (key.includes('.')) {
        const [relation, field] = key.split('.');
        andConditions.push({ [relation]: { some: { [field]: value } } });
        return;
      }

      if (key === 'status') {
        const statuses = Array.isArray(value) ? value : [value];
        andConditions.push({
          status: { in: statuses },
        });
        return;
      }
      if (key === 'role') {
        const roles = Array.isArray(value) ? value : [value];
        andConditions.push({
          role: { in: roles },
        });
        return;
      }
      if (key === 'plan') {
        const plans = Array.isArray(value) ? value : [value];
        andConditions.push({
          plan: { in: plans },
        });
        return;
      }
      if (key === 'gender') {
        const genders = Array.isArray(value) ? value : [value];
        andConditions.push({
          gender: { in: genders },
        });
        return;
      }

      andConditions.push({ [key]: value });
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      image: true,
      bloodGroup: true,
      gender: true,
    },
  });

  const total = await prisma.user.count({ where: whereConditions });

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get User by id
// -------------------------------------------------------
const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

// -------------------------------------------------------
// get my User
// -------------------------------------------------------
const getMyUser = async (req: Request) => {
  const userId = req.user.id;

  const result = await prisma.user.findMany({
    where: {
      id: userId,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      describe: true,
      city: true,
      address: true,
      image: true,
      bloodGroup: true,
      gender: true,
      allergies: true,
      isAgreeWithTerms: true,
      plan: true,
    },
  });

  return result;
};

// -------------------------------------------------------
// update User
// -------------------------------------------------------
const updateUser = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  const uploadedFiles = await handleFileUploads(files);

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  // Strip undefined values
  const cleanData = Object.fromEntries(
    Object.entries({ ...data, ...uploadedFiles }).filter(
      ([_, v]) => v !== undefined,
    ),
  );

  return prisma.user.update({
    where: { id },
    data: cleanData,
    select: userSelect,
  });
};

// -------------------------------------------------------
// toggle status User
// -------------------------------------------------------
const toggleStatusUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const newStatus = existingUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  return prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: userSelect,
  });
};

// -------------------------------------------------------
// soft delete User
// -------------------------------------------------------
const softDeleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if ((existingUser as any).isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User is already deleted');
  }
  const result = await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
    select: userSelect,
  });
  return result;
};

// -------------------------------------------------------
// hard delete User
// -------------------------------------------------------
const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await prisma.user.delete({ where: { id } });
  return result;
};

export const userService = {
  createUser,
  getUserList,
  getUserById,
  getMyUser,
  updateUser,
  toggleStatusUser,
  softDeleteUser,
  deleteUser,
};
