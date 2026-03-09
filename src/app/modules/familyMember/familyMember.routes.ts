import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { familyMemberController } from './familyMember.controller';
import { familyMemberValidation } from './familyMember.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();

const fileFields = fileUploader.upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'files', maxCount: 5 },
]);

router.post(
  '/',
  auth(),
  fileFields,
  validateRequest(familyMemberValidation.createSchema),
  familyMemberController.createFamilyMember,
);

router.get('/', auth(), familyMemberController.getFamilyMemberList);

router.get('/my', auth(), familyMemberController.getMyFamilyMember);

router.get('/:id', auth(), familyMemberController.getFamilyMemberById);

router.put(
  '/:id',
  auth(),
  fileFields,
  validateRequest(familyMemberValidation.updateSchema),
  familyMemberController.updateFamilyMember,
);

router.patch(
  '/toggle-status/:id',
  auth(),
  familyMemberController.toggleStatusFamilyMember,
);

router.delete(
  '/soft-delete/:id',
  auth(),
  familyMemberController.softDeleteFamilyMember,
);

router.delete('/:id', auth(), familyMemberController.deleteFamilyMember);

export const familyMemberRoutes = router;
