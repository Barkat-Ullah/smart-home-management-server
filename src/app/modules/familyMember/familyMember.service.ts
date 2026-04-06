import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { familyMemberSelect } from './familyMember.select';
import { buildFilterConditions } from './familyMember.utils';
import { fileUploader } from '../../utils/fileUploader';

// -------------------------------------------------------
// create FamilyMember
// -------------------------------------------------------
const createFamilyMember = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const addedData = { ...data, ...uploadedFiles, userId };
  const result = await prisma.familyMember.create({
    data: addedData,
    select: familyMemberSelect,
  });
  return result;
};

// -------------------------------------------------------
// get all FamilyMember
// -------------------------------------------------------
type IFamilyMemberFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  status?: string;
};

const familyMemberSearchAbleFields = ['fullName', 'email'];

const getFamilyMemberList = async (
  options: IPaginationOptions,
  filters: IFamilyMemberFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.FamilyMemberWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: familyMemberSearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.FamilyMemberWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.familyMember.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: familyMemberSelect,
    }),
    prisma.familyMember.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get FamilyMember by id
// -------------------------------------------------------
const getFamilyMemberById = async (id: string) => {
  const result = await prisma.familyMember.findUnique({
    where: { id },
    select: familyMemberSelect,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'FamilyMember not found');
  }
  return result;
};

// -------------------------------------------------------
// get my FamilyMember
// -------------------------------------------------------
const getMyFamilyMember = async (
  req: Request,
  options: IPaginationOptions,
  filters: IFamilyMemberFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.FamilyMemberWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: familyMemberSearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.FamilyMemberWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.familyMember.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: familyMemberSelect,
    }),
    prisma.familyMember.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// update FamilyMember
// -------------------------------------------------------
const updateFamilyMember = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploaded: string[] = [];

  if (files?.files) {
    for (const file of files.files) {
      const ext = file.originalname.split('.').pop()?.toLowerCase();

      let fileType: 'image' | 'video' | 'pdf' = 'pdf';

      if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext || ''))
        fileType = 'image';
      else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || ''))
        fileType = 'video';

      const upload = await fileUploader.uploadToCloudinaryWithType(
        file,
        fileType,
      );

      uploaded.push(upload.Location);
    }
  }

  const existingFamilyMember = await prisma.familyMember.findUnique({
    where: { id },
  });
  if (!existingFamilyMember) {
    throw new ApiError(httpStatus.NOT_FOUND, 'FamilyMember not found');
  }

  const updatedData = {
    ...data,
    files: uploaded.length ? [...uploaded] : existingFamilyMember.files,
  };

  const result = await prisma.familyMember.update({
    where: { id },
    data: updatedData,
    select: familyMemberSelect,
  });

  return result;
};

// -------------------------------------------------------
// toggle status FamilyMember
// -------------------------------------------------------
const toggleStatusFamilyMember = async (id: string) => {
  const existingFamilyMember = await prisma.familyMember.findUnique({
    where: { id },
  });
  if (!existingFamilyMember) {
    throw new ApiError(httpStatus.NOT_FOUND, 'FamilyMember not found');
  }

  // TODO: define your status enum toggle logic below
  // Example for enum: { ACTIVE -> INACTIVE, INACTIVE -> ACTIVE }
  const currentStatus = (existingFamilyMember as any).status;
  // const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const result = await prisma.familyMember.update({
    where: { id },
    data: { status: currentStatus /* replace with newStatus */ },
    select: familyMemberSelect,
  });

  return result;
};

// -------------------------------------------------------
// soft delete FamilyMember
// -------------------------------------------------------
const softDeleteFamilyMember = async (id: string) => {
  const existingFamilyMember = await prisma.familyMember.findUnique({
    where: { id },
  });
  if (!existingFamilyMember) {
    throw new ApiError(httpStatus.NOT_FOUND, 'FamilyMember not found');
  }
  if ((existingFamilyMember as any).isDeleted) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'FamilyMember is already deleted',
    );
  }
  const result = await prisma.familyMember.update({
    where: { id },
    data: { isDeleted: true },
    select: familyMemberSelect,
  });
  return result;
};

// -------------------------------------------------------
// hard delete FamilyMember
// -------------------------------------------------------
const deleteFamilyMember = async (id: string) => {
  const existingFamilyMember = await prisma.familyMember.findUnique({
    where: { id },
  });
  if (!existingFamilyMember) {
    throw new ApiError(httpStatus.NOT_FOUND, 'FamilyMember not found');
  }
  const result = await prisma.familyMember.delete({ where: { id } });
  return result;
};

export const familyMemberService = {
  createFamilyMember,
  getFamilyMemberList,
  getFamilyMemberById,
  getMyFamilyMember,
  updateFamilyMember,
  toggleStatusFamilyMember,
  softDeleteFamilyMember,
  deleteFamilyMember,
};
