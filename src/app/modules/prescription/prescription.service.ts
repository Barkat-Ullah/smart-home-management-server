import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import {
  cacheOr,
  CacheKeys,
  TTL,
  CacheInvalidator,
  invalidateKeys,
  invalidatePattern,
} from '../../../lib/redis';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import {
  prescriptionSelect,
  prescriptionWithMedicinesSelect,
} from './prescription.select';
import { buildFilterConditions } from './prescription.utils';

// -------------------------------------------------------
// create Prescription
// -------------------------------------------------------
const createPrescription = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const addedData = { ...data, ...uploadedFiles, userId };

  const result = await prisma.prescription.create({
    data: addedData,
    select: prescriptionSelect,
  });

  return result;
};

// -------------------------------------------------------
// get all Prescriptions (admin)
// -------------------------------------------------------
type IPrescriptionFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  userId?: string;
};

const prescriptionSearchableFields = ['title', 'doctorName', 'hospitalName'];

const getPrescriptionList = async (
  options: IPaginationOptions,
  filters: IPrescriptionFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.PrescriptionWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: prescriptionSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.PrescriptionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.prescription.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: prescriptionSelect,
    }),
    prisma.prescription.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get Prescription by id
// -------------------------------------------------------
const getPrescriptionById = async (id: string) => {
  const result = await prisma.prescription.findUnique({
    where: { id },
    select: prescriptionWithMedicinesSelect,
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Prescription not found');
  }

  return result;
};

// -------------------------------------------------------
// get my Prescriptions (logged-in user)
// -------------------------------------------------------
const getMyPrescriptions = async (
  req: Request,
  options: IPaginationOptions,
  filters: IPrescriptionFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  // Always scope to logged-in user
  const andConditions: Prisma.PrescriptionWhereInput[] = [{ userId }];

  if (searchTerm) {
    andConditions.push({
      OR: prescriptionSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.PrescriptionWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.prescription.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: prescriptionWithMedicinesSelect,
    }),
    prisma.prescription.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// update Prescription
// -------------------------------------------------------
const updatePrescription = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const updatedData = { ...data, ...uploadedFiles };

  const existing = await prisma.prescription.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Prescription not found');
  }

  // Only owner can update
  if (existing.userId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await prisma.prescription.update({
    where: { id },
    data: updatedData,
    select: prescriptionSelect,
  });

  return result;
};

// -------------------------------------------------------
// delete Prescription (hard delete + soft-delete medicines)
// -------------------------------------------------------
const deletePrescription = async (id: string) => {
  const existing = await prisma.prescription.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Prescription not found');
  }

  // Soft-delete all medicine schedules under this prescription first
  await prisma.medicineSchedule.updateMany({
    where: { prescriptionId: id },
    data: { isDeleted: true },
  });

  const result = await prisma.prescription.delete({ where: { id } });
  return result;
};

export const prescriptionService = {
  createPrescription,
  getPrescriptionList,
  getPrescriptionById,
  getMyPrescriptions,
  updatePrescription,
  deletePrescription,
};
