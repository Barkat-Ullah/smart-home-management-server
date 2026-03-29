import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { airConditionerSelect } from './airConditioner.select';
import { buildFilterConditions } from './airConditioner.utils';

// -------------------------------------------------------
// Create AirConditioner
// -------------------------------------------------------
const createAirConditioner = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;

  const houseroom = await prisma.houseroom.findUnique({
    where: { id: data.houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  // if (houseroom.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.airConditioner.create({
    data: { ...data, userId },
    select: airConditionerSelect,
  });

  return result;
};

// -------------------------------------------------------
// Get All AirConditioners (admin)
// -------------------------------------------------------
type IAirConditionerFilterRequest = {
  searchTerm?: string;
  id?: string;
  mode?: string;
  status?: string;
  isOn?: string;
  isDeleted?: string;
  houseroomId?: string;
  createdAt?: string;
};

const airConditionerSearchableFields = ['name', 'brand'];

const getAirConditionerList = async (
  options: IPaginationOptions,
  filters: IAirConditionerFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.AirConditionerWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: airConditionerSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.AirConditionerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.airConditioner.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: airConditionerSelect,
    }),
    prisma.airConditioner.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// Get AirConditioner by ID
// -------------------------------------------------------
const getAirConditionerById = async (id: string) => {
  const result = await prisma.airConditioner.findUnique({
    where: { id },
    select: airConditionerSelect,
  });
  if (!result)
    throw new AppError(httpStatus.NOT_FOUND, 'Air conditioner not found');
  return result;
};

// -------------------------------------------------------
// Get MY AirConditioners
// -------------------------------------------------------
const getMyAirConditioner = async (
  req: Request,
  options: IPaginationOptions,
  filters: IAirConditionerFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.AirConditionerWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: airConditionerSearchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.AirConditionerWhereInput = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.airConditioner.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: airConditionerSelect,
    }),
    prisma.airConditioner.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// Get ACs by Room
// -------------------------------------------------------
const getAcsByRoom = async (req: Request, houseroomId: string) => {
  const userId = req.user.id;

  const houseroom = await prisma.houseroom.findUnique({
    where: { id: houseroomId },
  });
  if (!houseroom)
    throw new AppError(httpStatus.NOT_FOUND, 'Houseroom not found');
  // if (houseroom.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.airConditioner.findMany({
    where: { houseroomId, userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    select: airConditionerSelect,
  });

  return result;
};

// -------------------------------------------------------
// Update AirConditioner
// -------------------------------------------------------
const updateAirConditioner = async (req: Request) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;

  const existing = await prisma.airConditioner.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Air conditioner not found');
  // if (existing.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.airConditioner.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      brand: data.brand ?? existing.brand,
      isOn: data.isOn ?? existing.isOn,
      temperature: data.temperature ?? existing.temperature,
      humidity: data.humidity ?? existing.humidity,
      fanSpeed: data.fanSpeed ?? existing.fanSpeed,
      mode: data.mode ?? existing.mode,
      status: data.status ?? existing.status,
      houseroomId: data.houseroomId ?? existing.houseroomId,
    },
    select: airConditionerSelect,
  });

  return result;
};

// -------------------------------------------------------
// Control AC (temperature, mode, fanSpeed, isOn)
// -------------------------------------------------------
const controlAirConditioner = async (req: Request) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { isOn, temperature, humidity, fanSpeed, mode } = req.body;

  const existing = await prisma.airConditioner.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Air conditioner not found');
  // if (existing.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  if (existing.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'Device is deleted');

  const result = await prisma.airConditioner.update({
    where: { id },
    data: {
      ...(isOn !== undefined && { isOn }),
      ...(temperature !== undefined && { temperature }),
      ...(humidity !== undefined && { humidity }),
      ...(fanSpeed !== undefined && { fanSpeed }),
      ...(mode !== undefined && { mode }),
    },
    select: airConditionerSelect,
  });

  return result;
};

// -------------------------------------------------------
// Toggle ON/OFF
// -------------------------------------------------------
const toggleAirConditioner = async (id: string, userId: string) => {
  const existing = await prisma.airConditioner.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Air conditioner not found');
  // if (existing.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

  const result = await prisma.airConditioner.update({
    where: { id },
    data: { isOn: !existing.isOn },
    select: airConditionerSelect,
  });

  return result;
};

// -------------------------------------------------------
// Soft Delete AirConditioner
// -------------------------------------------------------
const softDeleteAirConditioner = async (id: string, userId: string) => {
  const existing = await prisma.airConditioner.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Air conditioner not found');
  // if (existing.userId !== userId)
  //   throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  if (existing.isDeleted)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Air conditioner already deleted',
    );

  const result = await prisma.airConditioner.update({
    where: { id },
    data: { isDeleted: true },
    select: airConditionerSelect,
  });

  return result;
};

// -------------------------------------------------------
// Hard Delete AirConditioner
// -------------------------------------------------------
const deleteAirConditioner = async (id: string) => {
  const existing = await prisma.airConditioner.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, 'Air conditioner not found');

  await prisma.airConditioner.delete({ where: { id } });
  return { message: 'Air conditioner permanently deleted' };
};

export const airConditionerService = {
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
