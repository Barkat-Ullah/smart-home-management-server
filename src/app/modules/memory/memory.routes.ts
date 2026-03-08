import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { memoryController } from './memory.controller';
import { memoryValidation } from './memory.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();

router.post(
  '/',
  auth(),
  fileUploader.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'files', maxCount: 1 },
  ]),
  validateRequest(memoryValidation.createSchema),
  memoryController.createMemory,
);

router.get('/', auth(), memoryController.getMemoryList);

router.get('/my', auth(), memoryController.getMyMemory);

router.get('/:id', auth(), memoryController.getMemoryById);

router.put(
  '/:id',
  auth(),
  fileUploader.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'files', maxCount: 1 },
  ]),
  validateRequest(memoryValidation.updateSchema),
  memoryController.updateMemory,
);

router.patch(
  '/toggle-status/:id',
  auth(),
  memoryController.toggleStatusMemory,
);

router.patch(
  '/soft-delete/:id',
  auth(),
  memoryController.softDeleteMemory,
);

router.delete('/:id', auth(), memoryController.deleteMemory);

export const memoryRoutes = router;