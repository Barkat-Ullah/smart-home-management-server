import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { cctvCameraController } from './cctvCamera.controller';
import { cctvCameraValidation } from './cctvCamera.validation';

const router = express.Router();

// POST   /cctv-cameras                     → add a camera
router.post(
  '/',
  auth(),
  validateRequest(cctvCameraValidation.createSchema),
  cctvCameraController.createCctvCamera,
);

// GET    /cctv-cameras                     → admin: all cameras
router.get('/', auth('ADMIN'), cctvCameraController.getCctvCameraList);

// GET    /cctv-cameras/my                  → current user's cameras
router.get('/my', auth(), cctvCameraController.getMyCctvCamera);

// GET    /cctv-cameras/room/:houseroomId   → cameras in a specific room
router.get('/room/:houseroomId', auth(), cctvCameraController.getCamerasByRoom);

// GET    /cctv-cameras/stream/:id          → stream URL + credentials (owner only)
router.get('/stream/:id', auth(), cctvCameraController.getCameraStream);

// GET    /cctv-cameras/:id                 → single camera info
router.get('/:id', auth(), cctvCameraController.getCctvCameraById);

// PUT    /cctv-cameras/:id                 → update camera
router.put(
  '/:id',
  auth(),
  validateRequest(cctvCameraValidation.updateSchema),
  cctvCameraController.updateCctvCamera,
);

// PATCH  /cctv-cameras/toggle-status/:id   → toggle Online/Offline
router.patch(
  '/toggle-status/:id',
  auth(),
  cctvCameraController.toggleStatusCctvCamera,
);

// DELETE /cctv-cameras/soft/:id            → soft delete
router.delete('/soft/:id', auth(), cctvCameraController.softDeleteCctvCamera);

// DELETE /cctv-cameras/:id                 → hard delete (admin)
router.delete('/:id', auth('ADMIN'), cctvCameraController.deleteCctvCamera);

export const cctvCameraRoutes = router;
