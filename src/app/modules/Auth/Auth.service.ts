import sendOtpViaMail, { generateOtpEmail } from './../../utils/sendMail';
import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret, SignOptions } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { Prisma, User, UserRoleEnum, UserStatus } from '@prisma/client';
import { Response } from 'express';
import {
  getOtpStatusMessage,
  otpExpiryTime,
  generateOTP,
} from '../../utils/otp';
import { generateToken } from '../../utils/generateToken';
import { insecurePrisma, prisma } from '../../utils/prisma';
import emailSender from './../../utils/sendMail';
import { IClientInfo, IIPInfo } from '../../../types/ip.type';

// ========== LOGIN ==========
const loginWithOtpFromDB = async (
  res: Response,
  payload: { email: string; password: string, fcmToken?: string },
  clientInfo: IClientInfo | null | undefined,
  ipInfo: IIPInfo | null | undefined,
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
        ipInfo: ipInfo ? (ipInfo as unknown as Prisma.JsonObject) : undefined,
        lastLoginAt: new Date(),
        fcmToken:payload.fcmToken,
      },
    });

    const html = generateOtpEmail(otp);
    await emailSender(payload.email, html, 'OTP Verification');

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
        ipInfo: ipInfo ? (ipInfo as unknown as Prisma.JsonObject) : undefined,
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

    return {
      message: 'User logged in successfully',
      id: userData.id,
      name: userData.fullName,
      email: userData.email,
      role: userData.role,
      isEmailVerified: userData.isEmailVerified,
      accessToken,
    };
  }
};

// ========== REGISTER ==========

const registerWithOtpIntoDB = async (
  payload: User,
  clientInfo: IClientInfo | null | undefined,
  ipInfo: IIPInfo | null | undefined,
) => {
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

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
      ipInfo: ipInfo ? (ipInfo as unknown as Prisma.JsonObject) : undefined,
    },
  });

  try {
    const html = generateOtpEmail(otp);
    await emailSender(newUser.email, html, 'OTP Verification');
  } catch {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send OTP email',
    );
  }

  return 'Please check mail to verify your email';
};


// ======================== SELF LOGOUT ========================
const logoutUser = async (userId: string) => {
  await prisma.logout.create({
    data: { userId, logoutAt: new Date() },
  });

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
  if (!userIds.length) throw new AppError(httpStatus.BAD_REQUEST, 'No user IDs provided');

  // Verify all users exist
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });

  const foundIds = users.map(u => u.id);
  const notFound = userIds.filter(id => !foundIds.includes(id));
  if (notFound.length) {
    throw new AppError(httpStatus.NOT_FOUND, `Users not found: ${notFound.join(', ')}`);
  }

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

  if (!activeUsers.length) {
    return { message: 'No active users to log out', count: 0 };
  }

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

  return { message: `All ${userIds.length} active users have been logged out`, count: userIds.length };
};

// ======================== COMMON OTP VERIFY (REGISTER + FORGOT) ========================
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

  let message = 'OTP verified successfully!';

  if (user.isEmailVerified === false) {
    await prisma.user.update({
      where: { email: user.email },
      data: { otp: null, otpExpiry: null, isEmailVerified: true },
    });

    message = 'Email verified successfully!';

    // Generate access token for registration flow
    const accessToken = await generateToken(
      {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as SignOptions['expiresIn'],
    );

    return {
      message,
      accessToken,
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
    };
  }
  // Step 5: Handle forgot password case
  else {
    await prisma.user.update({
      where: { email: user.email },
      data: { otp: null, otpExpiry: null },
    });

    message = 'OTP verified for password reset!';
    return { message };
  }
};

// ======================== RESEND OTP ========================
const resendVerificationWithOtp = async (email: string) => {
  const user = await insecurePrisma.user.findFirst({ where: { email } });
  if (!user) {
    throw new AppError(401, 'User not found');
  }
  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is Suspended');
  }

  // if (user.isEmailVerified) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Email is already verified');
  // }

  const otp = generateOTP().toString();
  const expiry = otpExpiryTime();

  await prisma.user.update({
    where: { email },
    data: { otp, otpExpiry: expiry },
  });

  try {
    await emailSender(email, otp, 'OTP Verification');
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
const changePassword = async (user: any, payload: any) => {
  const userData = await insecurePrisma.user.findUnique({
    where: { email: user.email, status: 'ACTIVE' },
  });

  if (!userData) {
    throw new AppError(401, 'User not found');
  }

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

  return { message: 'Password changed successfully!' };
};

// ======================== FORGOT PASSWORD ========================
const forgetPassword = async (email: string) => {
  const userData = await prisma.user.findUnique({
    where: { email },
    select: { email: true, status: true, id: true, otpExpiry: true, otp: true },
  });
  if (!userData) {
    throw new AppError(401, 'User not found');
  }
  if (userData.status === UserStatus.SUSPENDED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User has been suspended');
  }

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
          const html = generateOtpEmail(otp);
          await emailSender(userData.email, html, 'OTP Verification');
        } catch (emailErr) {
          await tx.user.update({
            where: { email },
            data: { otp: null, otpExpiry: null },
          });

          console.error('Email sending failed:', emailErr);
          throw emailErr;
        }
      },
      {
        timeout: 15000,
        maxWait: 5000,
      },
    );
  } catch (err: any) {
    console.error('Forget password transaction failed:', {
      email,
      error: err,
      stack: err?.stack,
      message: err?.message,
    });

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to process OTP request',
    );
  }
  return { message: 'OTP sent successfully' };
};

// ======================== RESET PASSWORD ========================
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

// ======================== EXPORT ========================
export const AuthServices = {
  loginWithOtpFromDB,
  registerWithOtpIntoDB,
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
