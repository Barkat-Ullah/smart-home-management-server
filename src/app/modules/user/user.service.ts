import httpStatus from 'http-status';
import { Prisma, UserRoleEnum } from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import { Request } from 'express';
import { handleFileUploads } from '../../utils/handleFile';
import { userSelect } from './user.select';
import emailSender from '../../utils/sendMail';
import ApiError from '../../errors/AppError';
import {
  generateAdminCustomEmail,
  IAdminMailPayload,
  welcomeEmailTemplate,
} from '../../utils/allmailformat';
import bcrypt from 'bcrypt';
import {
  toUTCEndOfDay,
  toUTCEndOfMonth,
  toUTCStartOfDay,
  toUTCStartOfMonth,
} from '../event/event.utils';
import {
  cacheOr,
  CacheKeys,
  TTL,
  CacheInvalidator,
  invalidateKeys,
  invalidatePattern,
} from '../../../lib/redis';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// -------------------------------------------------------
// create User
// -------------------------------------------------------

const canCreateRole: Record<string, UserRoleEnum[]> = {
  [UserRoleEnum.ADMIN]: [UserRoleEnum.MODERATOR, UserRoleEnum.CAREGIVER],
  [UserRoleEnum.USER]: [UserRoleEnum.CAREGIVER],
};

const createUser = async (req: Request) => {
  const creatorId = req.user.id;
  const creatorRole = req.user.role as UserRoleEnum;
  const data = req.body;
  const targetRole = data.role as UserRoleEnum;

  const allowed = canCreateRole[creatorRole] || [];
  if (!allowed.includes(targetRole)) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `${creatorRole} cannot create a ${targetRole}`,
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');

  const userPass = data.password;
  const hashedPassword = await bcrypt.hash(userPass, BCRYPT_ROUNDS);

  const result = await prisma.user.create({
    data: { ...data, createdById: creatorId, password: hashedPassword },
    select: userSelect,
  });

  await CacheInvalidator.onRecordCreate('user');

  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: { fullName: true },
  });

  await emailSender(
    data.email,
    welcomeEmailTemplate({
      fullName: data.fullName,
      email: data.email,
      password: userPass,
      role: targetRole,
      createdByName: creator?.fullName || 'Admin',
    }),
    `Welcome to Smart Home — Your ${targetRole} Account`,
  );

  return result;
};

// -------------------------------------------------------
// User care giver
// -------------------------------------------------------

const getMyCareGiver = async (req: Request) => {
  const userId = req.user.id;
  const userRole = req.user.role as UserRoleEnum;

  const roleFilter: UserRoleEnum[] =
    userRole === UserRoleEnum.ADMIN
      ? [UserRoleEnum.MODERATOR, UserRoleEnum.CAREGIVER]
      : [UserRoleEnum.CAREGIVER];

  const result = await prisma.user.findMany({
    where: {
      createdById: userId,
      role: { in: roleFilter },
      isDeleted: false,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      describe: true,
      city: true,
      address: true,
      image: true,
      bloodGroup: true,
      gender: true,
      allergies: true,
      plan: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return result;
};

// -------------------------------------------------------
// get all User
// -------------------------------------------------------
type IUserFilterRequest = {
  searchTerm?: string;
  status?: string;
  role?: string;
  gender?: string;
  plan?: string;
  createdAt?: string;
  isEmailVerified?: string;
  isOnline?: string;
  isDeleted?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  isp?: string;
};

const userSearchAbleFields = [
  'fullName',
  'email',
  'phoneNumber',
  'city',
  'address',
  'bloodGroup',
];

const getUserList = async (
  options: IPaginationOptions,
  filters: IUserFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const cacheKey = CacheKeys.list('user', { ...options, ...filters });
  return (
    cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(
      cacheKey, TTL.SHORT, async () => {
        const andConditions: Prisma.UserWhereInput[] = [{ role: UserRoleEnum.USER }];

        if (searchTerm) {
          andConditions.push({
            OR: userSearchAbleFields.map(field => ({
              [field]: { contains: searchTerm, mode: 'insensitive' },
            })),
          });
        }

        if (Object.keys(filterData).length) {
          Object.keys(filterData).forEach(key => {
            const value = (filterData as any)[key];
            if (value === '' || value === null || value === undefined) return;

            if (key === 'createdAt') {
              const parts = (value as string).split('-');
              if (parts.length === 2) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                andConditions.push({
                  createdAt: {
                    gte: toUTCStartOfMonth(year, month),
                    lte: toUTCEndOfMonth(year, month),
                  },
                });
              } else if (parts.length === 3) {
                andConditions.push({
                  createdAt: {
                    gte: toUTCStartOfDay(value),
                    lte: toUTCEndOfDay(value),
                  },
                });
              }
              return;
            }

            if (['status', 'role', 'plan', 'gender'].includes(key)) {
              andConditions.push({
                [key]: { in: Array.isArray(value) ? value : [value] },
              });
              return;
            }

            if (['isEmailVerified', 'isOnline', 'isDeleted'].includes(key)) {
              andConditions.push({ [key]: value === 'true' });
              return;
            }

            if (['device', 'browser', 'os'].includes(key)) {
              andConditions.push({
                clientInfo: { string_contains: value },
              } as any);
              return;
            }

            if (['country', 'region', 'city', 'timezone', 'isp'].includes(key)) {
              andConditions.push({
                ipInfo: { string_contains: value },
              } as any);
              return;
            }

            andConditions.push({ [key]: value });
          });
        }

        const whereConditions: Prisma.UserWhereInput =
          andConditions.length > 0 ? { AND: andConditions } : {};

        const [result, total] = await Promise.all([
          prisma.user.findMany({
            skip,
            take: limit,
            where: whereConditions,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              role: true,
              status: true,
              describe: true,
              city: true,
              address: true,
              image: true,
              bloodGroup: true,
              gender: true,
              allergies: true,
              isAgreeWithTerms: true,
              plan: true,
              isEmailVerified: true,
              isDeleted: true,
              isOnline: true,
              clientInfo: true,
              ipInfo: true,
              lastLoginAt: true,
              createdAt: true,
              updatedAt: true,
              createdById: true,
            },
          }),
          prisma.user.count({ where: whereConditions }),
        ]);

        return { meta: { total, page, limit }, data: result };
      }
    ) ?? { meta: { total: 0, page, limit }, data: [] }
  );
};

// -------------------------------------------------------
// get User by id
// -------------------------------------------------------
const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

// -------------------------------------------------------
// get my User
// -------------------------------------------------------
const getMyUser = async (req: Request) => {
  const userId = req.user.id;

  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      describe: true,
      city: true,
      address: true,
      image: true,
      bloodGroup: true,
      gender: true,
      allergies: true,
      plan: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return result;
};

// -------------------------------------------------------
// update User
// -------------------------------------------------------
const updateUser = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  const uploadedFiles = await handleFileUploads(files);

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const cleanData = Object.fromEntries(
    Object.entries({ ...data, ...uploadedFiles }).filter(
      ([_, v]) => v !== undefined,
    ),
  );

  const result = await prisma.user.update({
    where: { id },
    data: cleanData,
    select: userSelect,
  });

  await CacheInvalidator.onOwnedRecordUpdate('user', id, id);
  return result;
};

// -------------------------------------------------------
// toggle status User
// -------------------------------------------------------
const toggleStatusUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const newStatus = existingUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  const result = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: userSelect,
  });

  await invalidateKeys(CacheKeys.single('auth-session', id));
  await CacheInvalidator.onRecordDelete('user', id, id);
  return result;
};

// -------------------------------------------------------
// soft delete User
// -------------------------------------------------------
const softDeleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if ((existingUser as any).isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User is already deleted');
  }
  const result = await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
    select: userSelect,
  });

  await invalidateKeys(CacheKeys.single('auth-session', id));
  await CacheInvalidator.onRecordDelete('user', id, id);
  return result;
};

// -------------------------------------------------------
// hard delete User
// -------------------------------------------------------
const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await prisma.user.delete({ where: { id } });
  await invalidateKeys(CacheKeys.single('auth-session', id));
  await CacheInvalidator.onRecordDelete('user', id);
  return result;
};

// ── 1. Single User ──
const sendMailToSingleUserFromDB = async (payload: ISingleMailPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.toEmail },
    select: { id: true, fullName: true, email: true, isDeleted: true },
  });

  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const mailPayload: IAdminMailPayload = {
    toName: user.fullName,
    toEmail: user.email,
    subject: payload.subject,
    body: payload.body,
    adminName: payload.adminName,
    priority: payload.priority ?? 'normal',
  };

  const html = generateAdminCustomEmail(mailPayload);
  await emailSender(user.email, html, payload.subject);

  return {
    message: `Email sent to ${user.fullName} (${user.email}) successfully`,
  };
};

// ── 2. Selected Users ──
const sendMailToSelectedUsersFromDB = async (
  payload: IBulkMailPayload & { userIds: string[] },
) => {
  if (!payload.userIds?.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No user IDs provided');
  }

  const users = await prisma.user.findMany({
    where: { id: { in: payload.userIds }, isDeleted: false },
    select: { id: true, fullName: true, email: true },
  });

  if (!users.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No valid users found');
  }

  const results = await Promise.allSettled(
    users.map(async user => {
      const html = generateAdminCustomEmail({
        toName: user.fullName,
        toEmail: user.email,
        subject: payload.subject,
        body: payload.body,
        adminName: payload.adminName,
        priority: payload.priority ?? 'normal',
      });
      await emailSender(user.email, html, payload.subject);
      return user.email;
    }),
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    message: `Email sent to ${sent} user(s)${failed ? `, ${failed} failed` : ''}`,
    data: { sent, failed, total: users.length },
  };
};

// ── 3. All Users ──
const sendMailToAllUsersFromDB = async (payload: IBulkMailPayload) => {
  let sent = 0;
  let failed = 0;
  let total = 0;

  const BATCH_SIZE = 200;
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const skip = (page - 1) * BATCH_SIZE;

    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: { id: true, fullName: true, email: true },
      take: BATCH_SIZE,
      skip,
    });

    if (users.length === 0) hasMore = false;

    total += users.length;

    const results = await Promise.allSettled(
      users.map(async user => {
        const html = generateAdminCustomEmail({
          toName: user.fullName,
          toEmail: user.email,
          subject: payload.subject,
          body: payload.body,
          adminName: payload.adminName,
          priority: payload.priority ?? 'normal',
        });
        await emailSender(user.email, html, payload.subject);
        return user.email;
      }),
    );

    sent += results.filter(r => r.status === 'fulfilled').length;
    failed += results.filter(r => r.status === 'rejected').length;

    if (users.length < BATCH_SIZE) hasMore = false;
    page += 1;
  }

  if (total === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found');
  }

  return {
    message: `Broadcast email sent to ${sent}/${total} users`,
    data: { sent, failed, total },
  };
};

export const userService = {
  createUser,
  getMyCareGiver,
  getUserList,
  getUserById,
  getMyUser,
  updateUser,
  toggleStatusUser,
  softDeleteUser,
  deleteUser,
  sendMailToAllUsersFromDB,
  sendMailToSelectedUsersFromDB,
  sendMailToSingleUserFromDB,
};