import httpStatus from 'http-status';
import { articleService } from './article.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import ApiError from '../../errors/AppError';
import { UserRoleEnum } from '@prisma/client';

const articleFilterableFields = [
  'searchTerm',
  'id',
  'createdAt',
  'status',
  'activity',
  'stage',
  'isKept',
];

// create Article
const createArticle = catchAsync(async (req: Request, res: Response) => {
  const result = await articleService.createArticle(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Article created successfully',
    data: result,
  });
});

// generate Article from AI
const generateArticle = catchAsync(async (req: Request, res: Response) => {
  const result = await articleService.generateArticleFromAi(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `${result.count} article(s) generated`,
    data: result,
  });
});

// keep Article (admin → publish to feed)
const keepArticle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await articleService.keepArticle(id, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article published to feed',
    data: result,
  });
});

// toggle save / unsave article
const toggleSaveArticle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await articleService.toggleSaveArticle(userId, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.isSave ? 'Article saved' : 'Article unsaved',
    data: result,
  });
});

// get my saved articles
const getMySavedArticles = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await articleService.getMySavedArticles(req.user.id, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Saved articles retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// get all Articles
const getArticleList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, articleFilterableFields);
  const result = await articleService.getArticleList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// get Article by id
const getArticleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await articleService.getArticleById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article retrieved successfully',
    data: result,
  });
});

// get my Articles
const getMyArticle = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, articleFilterableFields);
  const result = await articleService.getMyArticle(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My articles retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// get feed articles (isKept = true)
const getFeedArticles = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, articleFilterableFields);
  const result = await articleService.getFeedArticles(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed articles retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// update Article
const updateArticle = catchAsync(async (req: Request, res: Response) => {
  const result = await articleService.updateArticle(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article updated successfully',
    data: result,
  });
});

// toggle status Article
const toggleStatusArticle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await articleService.toggleStatusArticle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article status toggled successfully',
    data: result,
  });
});

// soft delete Article
const softDeleteArticle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await articleService.softDeleteArticle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article soft deleted successfully',
    data: result,
  });
});

// hard delete Article
const deleteArticle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await articleService.deleteArticle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article deleted successfully',
    data: result,
  });
});

export const articleController = {
  createArticle,
  generateArticle,
  keepArticle,
  toggleSaveArticle,
  getMySavedArticles,
  getArticleList,
  getArticleById,
  getMyArticle,
  getFeedArticles,
  updateArticle,
  toggleStatusArticle,
  softDeleteArticle,
  deleteArticle,
};
