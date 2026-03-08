import httpStatus from 'http-status';
import { feedService } from './feed.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

// ── Feed ──────────────────────────────────────────────

const createFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.createFeed(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Feed created successfully',
    data: result,
  });
});

const feedFilterableFields = [
  'searchTerm',
  'id',
  'createdAt',
  'status',
  'type',
  'priority',
];

const getFeedList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, feedFilterableFields);
  const result = await feedService.getFeedList(options, filters, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getFeedById = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.getFeedById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed details retrieved successfully',
    data: result,
  });
});

const getMyFeed = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, feedFilterableFields);
  const result = await feedService.getMyFeed(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My feed list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const updateFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.updateFeed(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed updated successfully',
    data: result,
  });
});

const changeFeedStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.changeFeedStatus(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed status changed successfully',
    data: result,
  });
});

const togglePinFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.togglePinFeed(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed pin toggled successfully',
    data: result,
  });
});

const toggleLockFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.toggleLockFeed(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed lock toggled successfully',
    data: result,
  });
});

const softDeleteFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.softDeleteFeed(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed soft deleted successfully',
    data: result,
  });
});

const deleteFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await feedService.deleteFeed(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed deleted successfully',
    data: result,
  });
});

export const feedController = {
  createFeed,
  getFeedList,
  getFeedById,
  getMyFeed,
  updateFeed,
  changeFeedStatus,
  toggleLockFeed,
  togglePinFeed,
  softDeleteFeed,
  deleteFeed,
};
