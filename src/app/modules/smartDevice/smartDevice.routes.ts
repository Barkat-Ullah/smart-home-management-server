import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { smartDeviceController } from './smartDevice.controller';
import { smartDeviceValidation } from './smartDevice.validation';

const router = express.Router();

// POST   /smart-devices              → add a device
router.post(
  '/',
  auth(),
  validateRequest(smartDeviceValidation.createSchema),
  smartDeviceController.createSmartDevice,
);

// GET    /smart-devices              → admin: all devices
router.get('/', auth('ADMIN'), smartDeviceController.getSmartDeviceList);

// GET    /smart-devices/my           → current user's devices
router.get('/my', auth(), smartDeviceController.getMySmartDevice);

// GET    /smart-devices/room/:houseroomId  → devices in a specific room
router.get(
  '/room/:houseroomId',
  auth(),
  smartDeviceController.getDevicesByRoom,
);

// GET    /smart-devices/:id          → single device
router.get('/:id', auth(), smartDeviceController.getSmartDeviceById);

// PUT    /smart-devices/:id          → update device info
router.put(
  '/:id',
  auth(),
  validateRequest(smartDeviceValidation.updateSchema),
  smartDeviceController.updateSmartDevice,
);

// PATCH  /smart-devices/toggle/:id   → toggle ON/OFF
router.patch('/toggle/:id', auth(), smartDeviceController.toggleSmartDevice);

// DELETE /smart-devices/soft/:id     → soft delete
router.delete('/soft/:id', auth(), smartDeviceController.softDeleteSmartDevice);

// DELETE /smart-devices/:id          → hard delete (admin)
router.delete('/:id', auth('ADMIN'), smartDeviceController.deleteSmartDevice);

export const smartDeviceRoutes = router;
