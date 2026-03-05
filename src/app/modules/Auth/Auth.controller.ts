import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { userService } from '../user/user.service';
import { AuthServices } from './Auth.service';

const loginWithOtp = catchAsync(async (req, res) => {
  const result = await AuthServices.loginWithOtpFromDB(
    res,
    req.body,
    req.clientInfo,
    req.ipInfo,
  );
  const { refreshToken } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: false,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: result,
  });
});

const registerWithOtp = catchAsync(async (req, res) => {
  const result = await AuthServices.registerWithOtpIntoDB(
    req.body,
    req.clientInfo,
    req.ipInfo,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User Created Successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token generated successfully!',
    data: result,
  });
});

const logoutUser = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  if (userId) {
    await AuthServices.logoutUser(userId);
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

// Admin: logout one user
const adminLogoutUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await AuthServices.adminLogoutUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// Admin: logout selected users
const adminLogoutSelectedUsers = catchAsync(async (req, res) => {
  const { userIds } = req.body; // string[]
  const result = await AuthServices.adminLogoutSelectedUsers(userIds);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// Admin: logout all users
const adminLogoutAllUsers = catchAsync(async (req, res) => {
  const result = await AuthServices.adminLogoutAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: { count: result.count },
  });
});
const resendVerificationWithOtp = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await AuthServices.resendVerificationWithOtp(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Verification OTP sent successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await AuthServices.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgetPassword(req.body.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Verification OTP has sent to email',
    data: result,
  });
});

const verifyOtpCommon = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyOtpCommon(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await AuthServices.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Reset!',
    data: null,
  });
});

const sendMailToSingleUser = catchAsync(async (req, res) => {
  const result = await userService.sendMailToSingleUserFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// ── Send mail to selected users ──
const sendMailToSelectedUsers = catchAsync(async (req, res) => {
  const result = await userService.sendMailToSelectedUsersFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

// ── Send mail to ALL users ──
const sendMailToAllUsers = catchAsync(async (req, res) => {
  const result = await userService.sendMailToAllUsersFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

export const AuthControllers = {
  loginWithOtp,
  registerWithOtp,
  logoutUser,
  resendVerificationWithOtp,
  changePassword,
  forgetPassword,
  verifyOtpCommon,
  resetPassword,
  adminLogoutUser,
  adminLogoutSelectedUsers,
  adminLogoutAllUsers,
  sendMailToSingleUser,
  sendMailToSelectedUsers,
  sendMailToAllUsers,
  refreshToken,
};
