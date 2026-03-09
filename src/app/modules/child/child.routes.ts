import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { childController } from './child.controller';
import { childValidation } from './child.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();
const fileUpload = fileUploader.upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'files', maxCount: 1 },
]);
router.post(
  '/',
  auth(),
  fileUpload,
  validateRequest(childValidation.createSchema),
  childController.createChild,
);

router.get('/', auth(), childController.getChildList);

router.get('/my', auth(), childController.getMyChild);

router.get('/:id', auth(), childController.getChildById);

router.put(
  '/:id',
  auth(),
  fileUpload,
  validateRequest(childValidation.updateSchema),
  childController.updateChild,
);

router.patch('/toggle-status/:id', auth(), childController.toggleStatusChild);

router.patch('/soft-delete/:id', auth(), childController.softDeleteChild);

router.delete('/:id', auth(), childController.deleteChild);

export const childRoutes = router;
