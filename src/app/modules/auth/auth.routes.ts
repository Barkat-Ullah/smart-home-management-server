import express from 'express';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import clientInfoParser from '../../middlewares/clientInfoPerser';
import { ipInfoMiddleware } from '../../middlewares/ipInfo';
import { authControllers } from './auth.controller';

const router = express.Router();

router.post(
  '/login',
  clientInfoParser,
  ipInfoMiddleware,
  authControllers.loginWithOtp,
);

router.post(
  '/register',
  clientInfoParser,
  ipInfoMiddleware,
  authControllers.registerWithOtp,
);

router.post('/refresh-token', authControllers.refreshToken);

router.post(
  '/admin/send-mail/single',
  auth(UserRoleEnum.ADMIN),
  authControllers.sendMailToSingleUser,
);

router.post(
  '/admin/send-mail/selected',
  auth(UserRoleEnum.ADMIN),
  authControllers.sendMailToSelectedUsers,
);

router.post(
  '/admin/send-mail/all',
  auth(UserRoleEnum.ADMIN),
  authControllers.sendMailToAllUsers,
);

// Self logout (authenticated)
router.post('/logout', auth(), authControllers.logoutUser);

// Admin: logout a specific user
router.post(
  '/admin/logout/:userId',
  auth(UserRoleEnum.ADMIN),
  authControllers.adminLogoutUser,
);

// Admin: logout selected users
// Body: { "userIds": ["id1", "id2", "id3"] }
router.post(
  '/admin/logout-selected',
  auth(UserRoleEnum.ADMIN),
  authControllers.adminLogoutSelectedUsers,
);

// Admin: logout ALL active users
router.post(
  '/admin/logout-all',
  auth(UserRoleEnum.ADMIN),
  authControllers.adminLogoutAllUsers,
);

router.post('/verify-email-with-otp', authControllers.verifyOtpCommon);

router.post(
  '/resend-verification-with-otp',
  authControllers.resendVerificationWithOtp,
);

router.post(
  '/change-password',
  auth(UserRoleEnum.USER, UserRoleEnum.ADMIN),
  authControllers.changePassword,
);

router.post(
  '/forget-password',
  // validateRequest.body(authValidation.forgetPasswordValidationSchema),
  authControllers.forgetPassword,
);

router.post(
  '/reset-password',
  // validateRequest.body(authValidation.resetPasswordValidationSchema),
  authControllers.resetPassword,
);

export const authRouters = router;
