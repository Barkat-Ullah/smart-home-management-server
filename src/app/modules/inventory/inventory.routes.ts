import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { inventoryController } from './inventory.controller';
import { inventoryValidation } from './inventory.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(inventoryValidation.createSchema),
  inventoryController.createInventory,
);

router.get('/', auth(), inventoryController.getInventoryList);

router.get('/my', auth(), inventoryController.getMyInventory);

router.get('/:id', auth(), inventoryController.getInventoryById);

router.put(
  '/:id',
  auth(),
  validateRequest(inventoryValidation.updateSchema),
  inventoryController.updateInventory,
);

router.patch(
  '/toggle-status/:id',
  auth(),
  inventoryController.toggleStatusInventory,
);

router.patch(
  '/soft-delete/:id',
  auth(),
  inventoryController.softDeleteInventory,
);

router.delete('/:id', auth(), inventoryController.deleteInventory);

export const inventoryRoutes = router;