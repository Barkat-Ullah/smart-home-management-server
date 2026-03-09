import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { userController } from './user.controller';
import { userValidation } from './user.validation';
import { fileUploader } from '../../utils/fileUploader';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRoleEnum.ADMIN,UserRoleEnum.USER),
  validateRequest(userValidation.createSchema),
  userController.createUser,
);

router.get('/', auth(), userController.getUserList);
router.get(
  '/create-user',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.USER),
  userController.fetchCareGiver,
);
router.get('/my', auth(), userController.getMyProfile);
router.get('/:id', auth(), userController.getUserById);

router.put(
  '/:id',
  auth(),
  validateRequest(userValidation.updateSchema),
  userController.updateUser,
);

router.patch('/toggle-status/:id', auth(), userController.toggleStatusUser);

router.patch('/soft-delete/:id', auth(), userController.softDeleteUser);

router.delete('/:id', auth(), userController.deleteUser);

export const userRoutes = router;
