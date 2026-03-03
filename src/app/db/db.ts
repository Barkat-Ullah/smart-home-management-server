import * as bcrypt from 'bcrypt';
import config from '../../config';
import { PLanType, UserRoleEnum, UserStatus } from '@prisma/client';
import prisma from '../utils/prisma';

export const initiateSuperAdmin = async () => {
  const hashedPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD! || '12345678',
    Number(config.bcrypt_salt_rounds),
  );
  const payload: any = {
    fullName: 'Super Admin',
    email: process.env.SUPER_ADMIN_MAIL!,
    password: hashedPassword,
    role: UserRoleEnum.ADMIN,
    isAgreeWithTerms: true,
    isEmailVerified: true,
    status: UserStatus.ACTIVE,
    plan:PLanType.Paid,
  };

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExistUser) return;

  await prisma.user.create({
    data: payload,
  });
};
