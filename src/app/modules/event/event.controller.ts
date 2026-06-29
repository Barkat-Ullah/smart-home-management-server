import httpStatus from 'http-status';
import { eventService } from './event.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

const eventFilterableFields = [
  'searchTerm',
  'id',
  'createdAt',
  'eventDate',
  'status',
  'category',
  'type',
  'priority',
];

// create Event
const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.createEvent(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Event created successfully',
    data: result,
  });
});

// get all Events
const getEventList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, eventFilterableFields);
  const result = await eventService.getEventList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// get Event by id
const getEventById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.getEventById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event details retrieved successfully',
    data: result,
  });
});

// get my Events
const getMyEvent = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, eventFilterableFields);
  const result = await eventService.getMyEvent(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My Event list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// update Event
const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.updateEvent(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event updated successfully',
    data: result,
  });
});

// toggle status Event
const toggleStatusEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.toggleStatusEvent(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event status toggled successfully',
    data: result,
  });
});

// soft delete Event
const softDeleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.softDeleteEvent(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event soft deleted successfully',
    data: result,
  });
});

// restore soft-deleted Event
const restoreEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.restoreEvent(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event restored successfully',
    data: result,
  });
});

// hard delete Event
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.deleteEvent(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event deleted successfully',
    data: result,
  });
});

export const eventController = {
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
