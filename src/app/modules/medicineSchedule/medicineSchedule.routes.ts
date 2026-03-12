import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { medicineScheduleController } from './medicineSchedule.controller';
import { medicineScheduleValidation } from './medicineSchedule.validation';


const router = express.Router();

// NOTE: /today must be declared BEFORE /:id to avoid route conflict
router.get('/today', auth(), medicineScheduleController.getTodaySchedules);

// POST /schedules — create new schedule (auto-generates 7-day reminders)
router.post(
  '/',
  auth(),
  validateRequest(medicineScheduleValidation.createSchema),
  medicineScheduleController.createMedicineSchedule,
);

// GET /schedules — admin: all schedules
router.get('/', auth(), medicineScheduleController.getMedicineScheduleList);

// GET /schedules/my — logged-in user's own schedules
router.get('/my', auth(), medicineScheduleController.getMyMedicineSchedules);

// GET /schedules/:id — single schedule with last 10 dose logs
router.get('/:id', auth(), medicineScheduleController.getMedicineScheduleById);

// PUT /schedules/:id — update schedule details
router.put(
  '/:id',
  auth(),
  validateRequest(medicineScheduleValidation.updateSchema),
  medicineScheduleController.updateMedicineSchedule,
);

// PATCH /schedules/:id/pause — pause active schedule
router.patch('/:id/pause', auth(), medicineScheduleController.pauseSchedule);

// PATCH /schedules/:id/resume — resume paused schedule
router.patch('/:id/resume', auth(), medicineScheduleController.resumeSchedule);

// PATCH /schedules/:id/complete — mark course as done
router.patch(
  '/:id/complete',
  auth(),
  medicineScheduleController.completeSchedule,
);

// DELETE /schedules/:id — soft delete
router.delete(
  '/:id',
  auth(),
  medicineScheduleController.deleteMedicineSchedule,
);

export const medicineScheduleRoutes = router;
