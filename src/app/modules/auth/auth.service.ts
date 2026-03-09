import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret, SignOptions } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import {
  Prisma,
  User,
  UserRoleEnum,
  UserStatus,
} from '@prisma/client';
import { Response } from 'express';
import {
  getOtpStatusMessage,
  otpExpiryTime,
  generateOTP,
} from '../../utils/otp';
import { generateToken } from '../../utils/generateToken';
import { insecurePrisma, prisma } from '../../utils/prisma';
import emailSender from '../../utils/sendMail';
import { IClientInfo, IIPInfo } from '../../../types/ip.type';

import {
  otpVerificationEmail,
  passwordChangedEmail,
  welcomeEmail,
} from '../../utils/allmailformat';
import { defaultRooms } from './auth.constant';
import ApiError from '../../errors/AppError';
import { verifyToken } from '../../utils/verifyToken';
import { IPWhoInfo } from '../../middlewares/ipInfo';

// ========== LOGIN ==========
// 📧 Template: otpVerificationEmail
const loginWithOtpFromDB = async (
  payload: { email: string; password: string; fcmToken?: string },
  clientInfo: IClientInfo | null | undefined,
  trackInfo: IPWhoInfo | null | undefined,
) => {

  const userData = await insecurePrisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userData) throw new AppError(401, 'User not found');

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password,
  );
  if (!isCorrectPassword)
    throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect');

  if (userData.role !== UserRoleEnum.ADMIN && !userData.isEmailVerified) {
    const otp = generateOTP().toString();

    await prisma.user.update({
      where: { email: userData.email },
      data: {
        otp,
        otpExpiry: otpExpiryTime(),
        clientInfo: clientInfo
          ? (clientInfo as unknown as Prisma.JsonObject)
          : undefined,
        trackInfo: trackInfo
          ? (trackInfo as unknown as Prisma.JsonObject)
          : undefined,
        lastLoginAt: new Date(),
        fcmToken: payload.fcmToken,
      },
    });

    // 📧 otpVerificationEmail — login email
    const html = otpVerificationEmail(otp, userData.fullName);
    await emailSender(payload.email, html, '🔐 OTP Verification — SmartHome');

    return {
      message: 'Please check your email for the verification OTP.',
      id: userData.id,
      name: userData.fullName,
      email: userData.email,
      role: userData.role,
      isEmailVerified: userData.isEmailVerified,
      accessToken: null,
    };
  } else {
    await prisma.user.update({
      where: { email: userData.email },
      data: {
        clientInfo: clientInfo
          ? (clientInfo as unknown as Prisma.JsonObject)
          : undefined,
        trackInfo: trackInfo
          ? (trackInfo as unknown as Prisma.JsonObject)
          : undefined,
        fcmToken: payload.fcmToken,
        lastLoginAt: new Date(),
      },
    });

    const accessToken = await generateToken(
      {
        id: userData.id,
        name: userData.fullName,
        email: userData.email,
        role: userData.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as SignOptions['expiresIn'],
    );
    const refreshToken = await generateToken(
      {
        id: userData.id,
        name: userData.fullName,
        email: userData.email,
        role: userData.role,
      },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as SignOptions['expiresIn'],
    );

    return {
      message: 'User logged in successfully',
      id: userData.id,
      name: userData.fullName,
      email: userData.email,
      role: userData.role,
      isEmailVerified: userData.isEmailVerified,
      accessToken,
      refreshToken,
    };
  }
};

// ========== REGISTER ==========
// 📧 Template 1: otpVerificationEmail
// 📧 Template 2: welcomeEmail
const registerWithOtpIntoDB = async (
  payload: User,
  clientInfo: IClientInfo | null | undefined,
  trackInfo: IPWhoInfo | null | undefined,
) => {
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  // const freeUserCount = await prisma.user.count({
  //   where: { plan: PLanType.Free, isDeleted: false },
  // });

  // if (freeUserCount >= 500) {
  //   throw new ApiError(403, 'Free plan is currently full');
  // }

  if (isUserExist)
    throw new AppError(httpStatus.CONFLICT, 'User already exists');

  const otp = generateOTP().toString();

  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      otp,
      otpExpiry: otpExpiryTime(),
      clientInfo: clientInfo
        ? (clientInfo as unknown as Prisma.JsonObject)
        : undefined,
      trackInfo: trackInfo
        ? (trackInfo as unknown as Prisma.JsonObject)
        : undefined,
    },
  });

  if (newUser) {
    await prisma.houseroom.createMany({
      data: defaultRooms.map(room => ({ ...room, userId: newUser.id })),
    });
  }

  try {
    const html = otpVerificationEmail(otp, newUser.fullName);
    await emailSender(newUser.email, html, '🔐 OTP Verification — SmartHome');
  } catch {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send OTP email',
    );
  }

  return 'Please check mail to verify your email';
};

// ======================== OTP VERIFY (REGISTER + FORGOT) ========================
// 📧 Template: welcomeEmail
const verifyOtpCommon = async (payload: { email: string; otp: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: {
      id: true,
      email: true,
      otp: true,
      otpExpiry: true,
      isEmailVerified: true,
      fullName: true,
      role: true,
    },
  });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');

  if (
    !user.otp ||
    user.otp !== payload.otp ||
    !user.otpExpiry ||
    new Date(user.otpExpiry).getTime() < Date.now()
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  if (user.isEmailVerified === false) {
    await prisma.user.update({
      where: { email: user.email },
      data: { otp: null, otpExpiry: null, isEmailVerified: true },
    });

    // 📧 welcomeEmail — Registration OTP verify
    try {
      const html = welcomeEmail(user.fullName);
      await emailSender(user.email, html, '🏠 Welcome to SmartHome!');
    } catch {
      console.error('Welcome email failed to send');
    }

    const accessToken = await generateToken(
      { id: user.id, name: user.fullName, email: user.email, role: user.role },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as SignOptions['expiresIn'],
    );
    const refreshToken = await generateToken(
      { id: user.id, name: user.fullName, email: user.email, role: user.role },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as SignOptions['expiresIn'],
    );

    return {
      message: 'Email verified successfully!',
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  } else {
    // Forgot password flow — OTP verify, no welcome mail
    await prisma.user.update({
      where: { email: user.email },
      data: { otp: null, otpExpiry: null },
    });
    return { message: 'OTP verified for password reset!' };
  }
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = await verifyToken(token, config.jwt.refresh_secret as Secret);
  } catch (err) {
    throw new Error('You are not authorized!');
  }

  const userData = await prisma.user.findUnique({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  if (!userData) {
    throw new ApiError(404, 'User not Found');
  }

  const accessToken = await generateToken(
    {
      id: userData.id,
      name: userData.fullName,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as SignOptions['expiresIn'],
  );

  return {
    accessToken,
  };
};

// ======================== RESEND OTP ========================
// 📧 Template: otpVerificationEmail — user resend request
const resendVerificationWithOtp = async (email: string) => {
  const user = await insecurePrisma.user.findFirst({ where: { email } });
  if (!user) throw new AppError(401, 'User not found');
  if (user.status === UserStatus.SUSPENDED)
    throw new AppError(httpStatus.FORBIDDEN, 'User is Suspended');

  const otp = generateOTP().toString();
  const expiry = otpExpiryTime();

  await prisma.user.update({
    where: { email },
    data: { otp, otpExpiry: expiry },
  });

  try {
    // 📧 otpVerificationEmail — resend OTP request
    const html = otpVerificationEmail(otp, user.fullName);
    await emailSender(email, html, '🔐 Resend OTP — SmartHome');
  } catch {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send OTP email',
    );
  }

  return {
    message: 'Verification OTP sent successfully. Please check your inbox.',
  };
};

// ======================== CHANGE PASSWORD ========================
// 📧 Template: passwordChangedEmail — password successfully change
const changePassword = async (user: any, payload: any) => {
  const userData = await insecurePrisma.user.findUnique({
    where: { email: user.email, status: 'ACTIVE' },
  });

  if (!userData) throw new AppError(401, 'User not found');

  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );
  if (!isCorrectPassword)
    throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect!');

  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { id: userData.id },
    data: { password: hashedPassword },
  });

  try {
    const changedAt = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
    });
    const html = passwordChangedEmail(userData.fullName, changedAt);
    await emailSender(userData.email, html, '🔒 Password Changed — SmartHome');
  } catch {
    console.error('Password change confirmation email failed');
  }

  return { message: 'Password changed successfully!' };
};

// ======================== FORGOT PASSWORD ========================
// 📧 Template: otpVerificationEmail — forgot password request
const forgetPassword = async (email: string) => {
  const userData = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      status: true,
      id: true,
      otpExpiry: true,
      otp: true,
      fullName: true,
    },
  });
  if (!userData) throw new AppError(401, 'User not found');
  if (userData.status === UserStatus.SUSPENDED)
    throw new AppError(httpStatus.BAD_REQUEST, 'User has been suspended');

  if (
    userData.otp &&
    userData.otpExpiry &&
    new Date(userData.otpExpiry).getTime() > Date.now()
  ) {
    const message = getOtpStatusMessage(userData.otpExpiry);
    throw new AppError(httpStatus.CONFLICT, message);
  }

  const otp = generateOTP().toString();
  const expireTime = otpExpiryTime();

  try {
    await prisma.$transaction(
      async tx => {
        await tx.user.update({
          where: { email },
          data: { otp, otpExpiry: expireTime },
        });

        try {
          // 📧 otpVerificationEmail
          const html = otpVerificationEmail(otp, userData.fullName);
          await emailSender(
            userData.email,
            html,
            '🔐 Password Reset OTP — SmartHome',
          );
        } catch (emailErr) {
          await tx.user.update({
            where: { email },
            data: { otp: null, otpExpiry: null },
          });
          console.error('Email sending failed:', emailErr);
          throw emailErr;
        }
      },
      { timeout: 15000, maxWait: 5000 },
    );
  } catch (err: any) {
    console.error('Forget password transaction failed:', { email, error: err });
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to process OTP request',
    );
  }

  return { message: 'OTP sent successfully' };
};

const resetPassword = async (payload: { password: string; email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  await prisma.user.update({
    where: { email: payload.email },
    data: { password: hashedPassword, otp: null, otpExpiry: null },
  });

  return { message: 'Password reset successfully' };
};

// ======================== SELF LOGOUT ========================
const logoutUser = async (userId: string) => {
  await prisma.logout.create({ data: { userId, logoutAt: new Date() } });
  await prisma.user.update({
    where: { id: userId },
    data: { fcmToken: null, isOnline: false },
  });
  return { message: 'Logged out successfully' };
};

// ======================== ADMIN: LOGOUT ONE USER ========================

const adminLogoutUser = async (targetUserId: string) => {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  await prisma.logout.create({
    data: { userId: targetUserId, logoutAt: new Date() },
  });
  await prisma.user.update({
    where: { id: targetUserId },
    data: { fcmToken: null, isOnline: false },
  });
  return { message: `User ${user.fullName} has been logged out` };
};

// ======================== ADMIN: LOGOUT SELECTED USERS ========================
const adminLogoutSelectedUsers = async (userIds: string[]) => {
  if (!userIds.length)
    throw new AppError(httpStatus.BAD_REQUEST, 'No user IDs provided');

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });
  const foundIds = users.map(u => u.id);
  const notFound = userIds.filter(id => !foundIds.includes(id));
  if (notFound.length)
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Users not found: ${notFound.join(', ')}`,
    );

  await prisma.$transaction([
    prisma.logout.createMany({
      data: userIds.map(userId => ({ userId, logoutAt: new Date() })),
    }),
    prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { fcmToken: null, isOnline: false },
    }),
  ]);
  return { message: `${userIds.length} user(s) have been logged out` };
};

// ======================== ADMIN: LOGOUT ALL USERS ========================
const adminLogoutAllUsers = async () => {
  const activeUsers = await prisma.user.findMany({
    where: { isOnline: true, isDeleted: false },
    select: { id: true },
  });

  if (!activeUsers.length)
    return { message: 'No active users to log out', count: 0 };

  const userIds = activeUsers.map(u => u.id);
  await prisma.$transaction([
    prisma.logout.createMany({
      data: userIds.map(userId => ({ userId, logoutAt: new Date() })),
    }),
    prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { fcmToken: null, isOnline: false },
    }),
  ]);
  return {
    message: `All ${userIds.length} active users have been logged out`,
    count: userIds.length,
  };
};

export const authServices = {
  loginWithOtpFromDB,
  registerWithOtpIntoDB,
  refreshToken,
  resendVerificationWithOtp,
  changePassword,
  forgetPassword,
  resetPassword,
  verifyOtpCommon,
  logoutUser,
  adminLogoutUser,
  adminLogoutSelectedUsers,
  adminLogoutAllUsers,
};
