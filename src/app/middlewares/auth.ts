import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../errors/AppError';
import { verifyToken } from '../utils/verifyToken';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import { insecurePrisma } from '../utils/prisma';
import { TTL, cacheOr, CacheKeys } from '../../lib/redis';

type TupleHasDuplicate<T extends readonly unknown[]> = T extends [
  infer F,
  ...infer R,
]
  ? F extends R[number]
  ? true
  : TupleHasDuplicate<R>
  : false;

type NoDuplicates<T extends readonly unknown[]> =
  TupleHasDuplicate<T> extends true ? never : T;

type CachedAuthSession = {
  lastLogoutAt: string | null;
  isDeleted: boolean;
  isEmailVerified: boolean;
  status: UserStatus;
  image: string | null;
};

const auth = <T extends readonly (UserRoleEnum | 'ANY')[]>(
  ...roles: NoDuplicates<T> extends never ? never : T
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifyUserToken = verifyToken(
        token,
        config.jwt.access_secret as Secret,
      );

      const cacheKey = CacheKeys.single('auth-session', verifyUserToken.id);

      const loadSession = async () => {
        const lastLogout = await insecurePrisma.logout.findFirst({
          where: { userId: verifyUserToken.id },
          orderBy: { logoutAt: 'desc' },
        });

        const user = await insecurePrisma.user.findUnique({
          where: { id: verifyUserToken.id },
          select: {
            isDeleted: true,
            isEmailVerified: true,
            status: true,
            image: true,
          },
        });

        if (!user) {
          return null;
        }

        return {
          lastLogoutAt: lastLogout?.logoutAt ?? null,
          isDeleted: user.isDeleted,
          isEmailVerified: user.isEmailVerified,
          status: user.status,
          image: user.image,
        } as CachedAuthSession;
      };

      const session = await cacheOr<CachedAuthSession | null>(
        cacheKey,
        TTL.SHORT,
        loadSession,
      );

      if (!session) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      if (
        session.lastLogoutAt &&
        new Date(session.lastLogoutAt) > new Date(verifyUserToken.iat! * 1000)
      ) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Session expired. Please login again.',
        );
      }

      if (session.isDeleted) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are deleted!');
      }
      if (!session.isEmailVerified) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not verified!');
      }
      if (session.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are suspended!');
      }

      if (session.image) {
        verifyUserToken.image = session.image;
      }

      req.user = verifyUserToken;

      if (roles.includes('ANY')) {
        next();
      } else {
        if (roles.length && !roles.includes(verifyUserToken.role)) {
          throw new AppError(httpStatus.FORBIDDEN, 'Forbidden!');
        }
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
