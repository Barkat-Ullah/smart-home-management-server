import httpStatus from 'http-status';
import { inventoryService } from './inventory.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pickValidFields';

// create Inventory
const createInventory = catchAsync(async (req: Request, res: Response) => {
  const result = await inventoryService.createInventory(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Inventory created successfully',
    data: result,
  });
});

// get all Inventory
const inventoryFilterableFields = ['searchTerm', 'id', 'createdAt', 'status'];
const getInventoryList = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, inventoryFilterableFields);
  const result = await inventoryService.getInventoryList(options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// get Inventory by id
const getInventoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await inventoryService.getInventoryById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory details retrieved successfully',
    data: result,
  });
});

// get my Inventory
const getMyInventory = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, inventoryFilterableFields);
  const result = await inventoryService.getMyInventory(req, options, filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My Inventory list retrieved successfully',
    data: result!.data,
    meta: result!.meta,
  });
});

// update Inventory
const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const result = await inventoryService.updateInventory(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory updated successfully',
    data: result,
  });
});

// toggle status Inventory
const toggleStatusInventory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await inventoryService.toggleStatusInventory(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Inventory status toggled successfully',
      data: result,
    });
  },
);

// soft delete Inventory
const softDeleteInventory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await inventoryService.softDeleteInventory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory soft deleted successfully',
    data: result,
  });
});

// hard delete Inventory
const deleteInventory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await inventoryService.deleteInventory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory deleted successfully',
    data: result,
  });
});

export const inventoryController = {
  createInventory,
  getInventoryList,
  getInventoryById,
  getMyInventory,
  updateInventory,
  toggleStatusInventory,
  softDeleteInventory,
  deleteInventory,
};
