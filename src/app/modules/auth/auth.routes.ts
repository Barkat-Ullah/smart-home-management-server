import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserRoleEnum } from '@prisma/client';
import clientInfoParser from '../../middlewares/clientInfoPerser';
import { trackMiddleware } from '../../middlewares/ipInfo';
import { authControllers } from './auth.controller';
import { authValidation } from './auth.validation';
import { authLimiter } from '../../../shared';

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  validateRequest(authValidation.loginUser),
  clientInfoParser,
  trackMiddleware,
  authControllers.loginWithOtp,
);

router.post(
  '/register',
  authLimiter,
  validateRequest(authValidation.registerUser),
  clientInfoParser,
  trackMiddleware,
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
  authLimiter,
  authControllers.resendVerificationWithOtp,
);

router.post(
  '/change-password',
  auth(UserRoleEnum.USER, UserRoleEnum.ADMIN),
  authControllers.changePassword,
);

router.post(
  '/forget-password',
  authLimiter,
  validateRequest(authValidation.forgetPasswordValidationSchema),
  authControllers.forgetPassword,
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest(authValidation.resetPasswordValidationSchema),
  authControllers.resetPassword,
);

export const authRouters = router;
