import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploader } from '../../utils/fileUploader';
import { prescriptionController } from './prescription.controller';
import { prescriptionValidation } from './prescription.validation';

const router = express.Router();

// POST /prescriptions — create with optional file upload
router.post(
  '/',
  auth(),
  fileUploader.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'files', maxCount: 1 },
  ]),
  validateRequest(prescriptionValidation.createSchema),
  prescriptionController.createPrescription,
);

// GET /prescriptions — admin: all prescriptions
router.get('/', auth(), prescriptionController.getPrescriptionList);

// GET /prescriptions/my — logged-in user's own prescriptions
router.get('/my', auth(), prescriptionController.getMyPrescriptions);

// GET /prescriptions/:id — single prescription with medicines
router.get('/:id', auth(), prescriptionController.getPrescriptionById);

// PUT /prescriptions/:id — update
router.put(
  '/:id',
  auth(),
  fileUploader.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'files', maxCount: 1 },
  ]),
  validateRequest(prescriptionValidation.updateSchema),
  prescriptionController.updatePrescription,
);

// DELETE /prescriptions/:id — hard delete prescription + soft-delete medicines
router.delete('/:id', auth(), prescriptionController.deletePrescription);

export const prescriptionRoutes = router;
