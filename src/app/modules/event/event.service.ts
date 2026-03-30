import httpStatus from 'http-status';
import { EventStatus, Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { eventSelect } from './event.select';
import { buildFilterConditions } from './event.utils';

// -------------------------------------------------------
// create Event
// -------------------------------------------------------
const createEvent = async (req: Request) => {
  const userId = req.user.id;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const uploadedFiles = await handleFileUploads(files);
  const addedData = { ...data, ...uploadedFiles, userId };

  const result = await prisma.event.create({
    data: addedData,
    select: eventSelect,
  });
  return result;
};

// -------------------------------------------------------
// get all Events (admin / public listing)
// -------------------------------------------------------
type IEventFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
  status?: string;
  category?: string;
  type?: string;
  priority?: string;
  eventDate?: string;
};

// Fields that are actually on the Event model and searchable
const eventSearchAbleFields = ['title', 'description', 'location', 'notes'];

const getEventList = async (
  options: IPaginationOptions,
  filters: IEventFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.EventWhereInput[] = [{ isDeleted: false }];

  if (searchTerm) {
    andConditions.push({
      OR: eventSearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.EventWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.event.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      select: eventSelect,
    }),
    prisma.event.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// get Event by id
// -------------------------------------------------------
const getEventById = async (id: string) => {
  const result = await prisma.event.findUnique({
    where: { id, isDeleted: false },
    select: eventSelect,
  });
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Event not found or has been deleted',
    );
  }
  // if ((result as any).isDeleted) {
  //   throw new ApiError(httpStatus.GONE, 'Event has been deleted');
  // }
  return result;
};

// -------------------------------------------------------
// get my Events (scoped to logged-in user)
// -------------------------------------------------------
const getMyEvent = async (
  req: Request,
  options: IPaginationOptions,
  filters: IEventFilterRequest,
) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  // Always scope to current user and non-deleted
  const andConditions: Prisma.EventWhereInput[] = [
    { userId },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: eventSearchAbleFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push(...buildFilterConditions(filterData));
  }

  const whereConditions: Prisma.EventWhereInput = { AND: andConditions };

  const [result, total] = await Promise.all([
    prisma.event.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: { eventDate: 'asc' },
      select: eventSelect,
    }),
    prisma.event.count({ where: whereConditions }),
  ]);

  return { meta: { total, page, limit }, data: result };
};

// -------------------------------------------------------
// update Event
// -------------------------------------------------------
const updateEvent = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const existingEvent = await prisma.event.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existingEvent) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Event not found or Cannot update a deleted event',
    );
  }
  // if ((existingEvent as any).isDeleted) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a deleted event');
  // }

  const uploadedFiles = await handleFileUploads(files);

  // Auto-set completedAt / cancelledAt timestamps when status changes
  const statusTimestamps: Partial<{
    completedAt: Date | null;
    cancelledAt: Date | null;
  }> = {};

  if (
    data.status === EventStatus.Completed &&
    !(existingEvent as any).completedAt
  ) {
    statusTimestamps.completedAt = new Date();
  }
  if (
    data.status === EventStatus.Cancelled &&
    !(existingEvent as any).cancelledAt
  ) {
    statusTimestamps.cancelledAt = new Date();
  }
  // If reverting from Completed/Cancelled, clear the timestamps
  if (
    data.status &&
    data.status !== EventStatus.Completed &&
    (existingEvent as any).status === EventStatus.Completed
  ) {
    statusTimestamps.completedAt = null;
  }
  if (
    data.status &&
    data.status !== EventStatus.Cancelled &&
    (existingEvent as any).status === EventStatus.Cancelled
  ) {
    statusTimestamps.cancelledAt = null;
  }

  const result = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      ...uploadedFiles,
      ...statusTimestamps,
    },
    select: eventSelect,
  });

  return result;
};

// -------------------------------------------------------
// toggle status Event
// -------------------------------------------------------

const toggleStatusEvent = async (req: Request) => {
  const { id } = req.params;
  const { status } = req.body;

  const existingEvent = await prisma.event.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existingEvent) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Event not found or Cannot toggle status of a deleted event',
    );
  }
  // if ((existingEvent as any).isDeleted) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     'Cannot toggle status of a deleted event',
  //   );
  // }

  // Validate the incoming status is a valid EventStatus
  const validStatuses = Object.values(EventStatus);
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Valid values: ${validStatuses.join(', ')}`,
    );
  }

  const currentStatus = (existingEvent as any).status as EventStatus;
  const newStatus = status as EventStatus;

  const statusTimestamps: Record<string, Date | null> = {};

  if (
    newStatus === EventStatus.Completed &&
    currentStatus !== EventStatus.Completed
  ) {
    statusTimestamps.completedAt = new Date();
  }
  if (
    newStatus === EventStatus.Cancelled &&
    currentStatus !== EventStatus.Cancelled
  ) {
    statusTimestamps.cancelledAt = new Date();
  }

  // Clear timestamps if reverting
  if (
    newStatus !== EventStatus.Completed &&
    currentStatus === EventStatus.Completed
  ) {
    statusTimestamps.completedAt = null;
  }
  if (
    newStatus !== EventStatus.Cancelled &&
    currentStatus === EventStatus.Cancelled
  ) {
    statusTimestamps.cancelledAt = null;
  }

  const result = await prisma.event.update({
    where: { id },
    data: { status: newStatus, ...statusTimestamps },
    select: eventSelect,
  });

  return result;
};

// -------------------------------------------------------
// soft delete Event
// -------------------------------------------------------
const softDeleteEvent = async (id: string) => {
  const existingEvent = await prisma.event.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existingEvent) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Event not found or Event is already deleted',
    );
  }
  // if ((existingEvent as any).isDeleted) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Event is already deleted');
  // }
  const result = await prisma.event.update({
    where: { id },
    data: { isDeleted: true },
    select: eventSelect,
  });
  return result;
};

// -------------------------------------------------------
// restore soft-deleted Event
// -------------------------------------------------------
const restoreEvent = async (id: string) => {
  const existingEvent = await prisma.event.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existingEvent) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Event not found or Event is not deleted',
    );
  }
  // if (!(existingEvent as any).isDeleted) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Event is not deleted');
  // }
  const result = await prisma.event.update({
    where: { id },
    data: { isDeleted: false },
    select: eventSelect,
  });
  return result;
};

// -------------------------------------------------------
// hard delete Event
// -------------------------------------------------------
const deleteEvent = async (id: string) => {
  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  const result = await prisma.event.delete({ where: { id } });
  return result;
};

export const eventService = {
  createEvent,
  getEventList,
  getEventById,
  getMyEvent,
  updateEvent,
  toggleStatusEvent,
  softDeleteEvent,
  restoreEvent,
  deleteEvent,
};
