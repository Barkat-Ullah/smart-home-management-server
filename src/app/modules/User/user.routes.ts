import express, { Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { UserControllers } from './user.controller';
// import validateRequest from '../../middlewares/validateRequest';
// import { userValidation } from './user.validation';
import { UserRoleEnum } from '@prisma/client';
import { fileUploader } from '../../utils/fileUploader';
import catchAsync from '../../utils/catchAsync';
import axios from 'axios';
import { ipInfoMiddleware } from '../../middlewares/ipInfo';

const router = express.Router();

router.get(
  '/',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.USER),
  UserControllers.getAllUsers,
);
router.get(
  '/ip',
  ipInfoMiddleware,
  catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      ip: req.ipInfo?.ip,
      city: req.ipInfo?.city,
      country: req.ipInfo?.country,
    });
  }),
);
router.get(
  '/me',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.USER),
  UserControllers.getMyimage,
);
router.get('/:id', auth('ANY'), UserControllers.getUserDetails);

router.delete('/soft-delete', auth('ANY'), UserControllers.softDeleteUser);
router.delete(
  '/hard-delete/:id',
  auth(UserRoleEnum.ADMIN),
  UserControllers.hardDeleteUser,
);

router.put(
  '/user-role/:id',
  auth(UserRoleEnum.ADMIN),
  // validateRequest.body(userValidation.updateUserRoleSchema),
  UserControllers.updateUserRoleStatus,
);

router.put(
  '/user-status/:id',
  auth(UserRoleEnum.ADMIN),
  // validateRequest.body(userValidation.updateUserStatus),
  UserControllers.updateUserStatus,
);
router.put(
  '/approve-user',
  auth(UserRoleEnum.ADMIN),
  UserControllers.updateUserApproval,
);

router.put(
  '/update-user/:id',
  fileUploader.uploadSingle, // "image"
  auth(UserRoleEnum.ADMIN),
  // validateRequest.body(userValidation.updateUser),
  UserControllers.updateUser,
);

router.put(
  '/update-image',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.USER),
  fileUploader.uploadSingle, // "image"
  UserControllers.updateMyimage,
);

export const UserRouters = router;
