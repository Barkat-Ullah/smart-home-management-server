import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { doseLogController } from './doseLog.controller';
import { doseLogValidation } from './doseLog.validation';

const router = express.Router();

// NOTE: /adherence and /my must be before /:id
router.get('/adherence', auth(), doseLogController.getAdherenceReport);
router.get('/my', auth(), doseLogController.getMyDoseLogs);

// POST /doses — log a dose (create or update same slot)
router.post(
  '/',
  auth(),
  validateRequest(doseLogValidation.createSchema),
  doseLogController.logDose,
);

// GET /doses — admin: all dose logs with filters
router.get('/', auth(), doseLogController.getDoseLogList);

export const doseLogRoutes = router;
