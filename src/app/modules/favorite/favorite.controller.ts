import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';
import { favoriteService } from './favorite.service';

// create Favorite
const createFavorite = catchAsync(async (req: Request, res: Response) => {
  const { articleId } = req.params;
  const result = await favoriteService.createFavorite(req.user.id, articleId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.isFavorite
      ? 'Added to favorites'
      : 'Removed from favorites',
    data: result,
  });
});

// get all Favorite
const favoriteFilterableFields = ['searchTerm', 'id', 'createdAt'];
const getFavoriteList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, favoriteFilterableFields);
  const result = await favoriteService.getFavoriteListIntoDb(
    options,
    filters,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite list retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

// get Favorite by id
const getFavoriteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await favoriteService.getFavoriteById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite details retrieved successfully',
    data: result,
  });
});

// update Favorite
const updateFavorite = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await favoriteService.updateFavoriteIntoDb(id, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite updated successfully',
    data: result,
  });
});

// delete Favorite
const deleteFavorite = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await favoriteService.deleteFavoriteIntoDb(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Favorite deleted successfully',
    data: result,
  });
});

export const favoriteController = {
  createFavorite,
  getFavoriteList,
  getFavoriteById,
  updateFavorite,
  deleteFavorite,
};
