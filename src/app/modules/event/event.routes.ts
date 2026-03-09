import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { eventController } from './event.controller';
import { eventValidation } from './event.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();

const fileUpload = fileUploader.upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'files', maxCount: 1 },
]);

// ─── Create ───────────────────────────────────────────
router.post(
  '/',
  auth(),
  fileUpload,
  validateRequest(eventValidation.createSchema),
  eventController.createEvent,
);

// ─── Read ─────────────────────────────────────────────
router.get('/', auth(), eventController.getEventList);

// IMPORTANT: specific routes before parameterized ones
router.get('/my', auth(), eventController.getMyEvent);

router.get('/:id', auth(), eventController.getEventById);

// ─── Update ───────────────────────────────────────────
router.put(
  '/:id',
  auth(),
  fileUpload,
  validateRequest(eventValidation.updateSchema),
  eventController.updateEvent,
);

router.patch('/toggle-status/:id', auth(), eventController.toggleStatusEvent);

// ─── Delete / Restore ─────────────────────────────────
router.delete('/soft-delete/:id', auth(), eventController.softDeleteEvent);

router.patch('/restore/:id', auth(), eventController.restoreEvent);

router.delete('/:id', auth(), eventController.deleteEvent);

export const eventRoutes = router;
