import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { airConditionerController } from './airConditioner.controller';
import { airConditionerValidation } from './airConditioner.validation';

const router = express.Router();

// POST   /air-conditioners              → add AC
router.post(
  '/',
  auth(),
  validateRequest(airConditionerValidation.createSchema),
  airConditionerController.createAirConditioner,
);

// GET    /air-conditioners              → admin: all ACs
router.get('/', auth('ADMIN'), airConditionerController.getAirConditionerList);

// GET    /air-conditioners/my           → current user's ACs
router.get('/my', auth(), airConditionerController.getMyAirConditioner);

// GET    /air-conditioners/room/:houseroomId  → ACs in a room
router.get('/room/:houseroomId', auth(), airConditionerController.getAcsByRoom);

// GET    /air-conditioners/:id          → single AC
router.get('/:id', auth(), airConditionerController.getAirConditionerById);

// PUT    /air-conditioners/:id          → update AC info
router.put(
  '/:id',
  auth(),
  validateRequest(airConditionerValidation.updateSchema),
  airConditionerController.updateAirConditioner,
);

// PATCH  /air-conditioners/control/:id  → control (temp/mode/fanSpeed/isOn)
router.patch(
  '/control/:id',
  auth(),
  validateRequest(airConditionerValidation.controlSchema),
  airConditionerController.controlAirConditioner,
);

// PATCH  /air-conditioners/toggle/:id   → toggle ON/OFF
router.patch(
  '/toggle/:id',
  auth(),
  airConditionerController.toggleAirConditioner,
);

// DELETE /air-conditioners/soft/:id     → soft delete
router.delete(
  '/soft/:id',
  auth(),
  airConditionerController.softDeleteAirConditioner,
);

// DELETE /air-conditioners/:id          → hard delete (admin)
router.delete(
  '/:id',
  auth('ADMIN'),
  airConditionerController.deleteAirConditioner,
);

export const airConditionerRoutes = router;
