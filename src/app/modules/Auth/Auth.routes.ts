import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import { authValidation } from './Auth.validation';
import { AuthControllers } from './Auth.controller';
import clientInfoParser from '../../middlewares/clientInfoPerser';
import { ipInfoMiddleware } from '../../middlewares/ipInfo';

const router = express.Router();

router.post(
  '/login',
  clientInfoParser,
  ipInfoMiddleware,
  AuthControllers.loginWithOtp,
);

router.post(
  '/register',
  clientInfoParser,
  ipInfoMiddleware,
  AuthControllers.registerWithOtp,
);

router.post(
  '/admin/send-mail/single',
  auth(UserRoleEnum.ADMIN),
  AuthControllers.sendMailToSingleUser,
);

router.post(
  '/admin/send-mail/selected',
  auth(UserRoleEnum.ADMIN),
  AuthControllers.sendMailToSelectedUsers,
);

router.post(
  '/admin/send-mail/all',
  auth(UserRoleEnum.ADMIN),
  AuthControllers.sendMailToAllUsers,
);

// Self logout (authenticated)
router.post('/logout', auth(), AuthControllers.logoutUser);

// Admin: logout a specific user
router.post(
  '/admin/logout/:userId',
  auth(UserRoleEnum.ADMIN),
  AuthControllers.adminLogoutUser,
);

// Admin: logout selected users
// Body: { "userIds": ["id1", "id2", "id3"] }
router.post(
  '/admin/logout-selected',
  auth(UserRoleEnum.ADMIN),
  AuthControllers.adminLogoutSelectedUsers,
);

// Admin: logout ALL active users
router.post(
  '/admin/logout-all',
  auth(UserRoleEnum.ADMIN),
  AuthControllers.adminLogoutAllUsers,
);

router.post('/verify-email-with-otp', AuthControllers.verifyOtpCommon);

router.post(
  '/resend-verification-with-otp',
  AuthControllers.resendVerificationWithOtp,
);

router.post(
  '/change-password',
  auth(UserRoleEnum.USER, UserRoleEnum.ADMIN),
  AuthControllers.changePassword,
);

router.post(
  '/forget-password',
  // validateRequest.body(authValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/reset-password',
  // validateRequest.body(authValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

export const AuthRouters = router;
