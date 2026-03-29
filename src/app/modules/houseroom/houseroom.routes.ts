import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { houseroomController } from './houseroom.controller';
import { houseroomValidation } from './houseroom.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();

const fileUpload = fileUploader.upload.fields([{ name: 'files', maxCount: 1 }]);

// POST   /houserooms          → create a new custom room
router.post(
  '/',
  auth(),
  fileUpload,
  validateRequest(houseroomValidation.createSchema),
  houseroomController.createHouseroom,
);

// GET    /houserooms           → admin: all rooms
router.get('/', auth('ADMIN'), houseroomController.getHouseroomList);

// GET    /houserooms/my        → current user's rooms
router.get('/my', auth(), houseroomController.getMyHouseroom);

// GET    /houserooms/:id       → single room by id
router.get('/:id', auth(), houseroomController.getHouseroomById);

// PUT    /houserooms/:id       → update room
router.put(
  '/:id',
  auth(),
  fileUpload,
  validateRequest(houseroomValidation.updateSchema),
  houseroomController.updateHouseroom,
);

// DELETE /houserooms/soft/:id  → soft delete (non-default rooms only)
router.delete('/soft/:id', auth(), houseroomController.softDeleteHouseroom);

// DELETE /houserooms/:id       → hard delete (admin / non-default rooms only)
router.delete('/:id', auth('ADMIN'), houseroomController.deleteHouseroom);

export const houseroomRoutes = router;
