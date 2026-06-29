import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { cacheOr, CacheKeys, TTL, CacheInvalidator } from '../../../lib/redis';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';

const PAYMENT_MODEL = 'payment';

const paymentSelect = {
  id: true, userId: true, subscriptionId: true, amount: true, currency: true,
  status: true, paymentMethodType: true, cardBrand: true, cardLast4: true,
  cardExpMonth: true, cardExpYear: true, stripeSessionId: true, stripePaymentId: true,
  stripeCustomerId: true, createdAt: true, updatedAt: true,
};

const createPayment = async (req: Request) => { console.log(''); };

type IPaymentFilterRequest = { searchTerm?: string; id?: string; createdAt?: string; status?: string; };
const paymentSearchAbleFields = ['fullName', 'email'];

const getPaymentList = async (options: IPaginationOptions, filters: IPaymentFilterRequest) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const cacheKey = CacheKeys.list(PAYMENT_MODEL, { ...options, ...filters });
  return (cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(cacheKey, TTL.SHORT, async () => {
    const andConditions: Prisma.PaymentWhereInput[] = [];
    if (searchTerm) andConditions.push({ OR: paymentSearchAbleFields.map(f => ({ [f]: { contains: searchTerm, mode: 'insensitive' } })) });
    if (Object.keys(filterData).length) {
      Object.keys(filterData).forEach(key => {
        const value = (filterData as any)[key];
        if (!value) return;
        if (key === 'createdAt') {
          const parts = (value as string).split('-');
          if (parts.length === 2) {
            const y = parseInt(parts[0]), m = parseInt(parts[1]) - 1;
            andConditions.push({ createdAt: { gte: new Date(y, m, 1).toISOString(), lte: new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString() } });
          } else {
            const s = new Date(value); s.setHours(0, 0, 0, 0);
            const e = new Date(value); e.setHours(23, 59, 59, 999);
            andConditions.push({ createdAt: { gte: s.toISOString(), lte: e.toISOString() } });
          }
          return;
        }
        if (key.includes('.')) { const [r, f] = key.split('.'); andConditions.push({ [r]: { some: { [f]: value } } }); return; }
        andConditions.push({ [key]: value });
      });
    }
    const w = andConditions.length ? { AND: andConditions } : {};
    const [result, total] = await Promise.all([
      prisma.payment.findMany({ skip, take: limit, where: w, orderBy: { createdAt: 'desc' }, select: paymentSelect }),
      prisma.payment.count({ where: w }),
    ]);
    return { meta: { total, page, limit }, data: result };
  }) ?? { meta: { total: 0, page, limit }, data: [] });
};

const getPaymentById = async (id: string) => {
  const result = await prisma.payment.findUnique({ where: { id }, select: paymentSelect });
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  return result;
};

const getMyPayment = async (req: Request, options: IPaginationOptions, filters: IPaymentFilterRequest) => {
  const userId = req.user.id;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const cacheKey = CacheKeys.myList(PAYMENT_MODEL, userId, { ...options, ...filters });
  return (cacheOr<{ meta: { total: number; page: number; limit: number }; data: any[] }>(cacheKey, TTL.SHORT, async () => {
    const andConditions: Prisma.PaymentWhereInput[] = [{ userId }];
    if (searchTerm) andConditions.push({ OR: paymentSearchAbleFields.map(f => ({ [f]: { contains: searchTerm, mode: 'insensitive' } })) });
    if (Object.keys(filterData).length) {
      Object.keys(filterData).forEach(key => {
        const value = (filterData as any)[key];
        if (!value) return;
        if (key === 'createdAt') {
          const parts = (value as string).split('-');
          if (parts.length === 2) {
            const y = parseInt(parts[0]), m = parseInt(parts[1]) - 1;
            andConditions.push({ createdAt: { gte: new Date(y, m, 1).toISOString(), lte: new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString() } });
          } else {
            const s = new Date(value); s.setHours(0, 0, 0, 0);
            const e = new Date(value); e.setHours(23, 59, 59, 999);
            andConditions.push({ createdAt: { gte: s.toISOString(), lte: e.toISOString() } });
          }
          return;
        }
        if (key.includes('.')) { const [r, f] = key.split('.'); andConditions.push({ [r]: { some: { [f]: value } } }); return; }
        andConditions.push({ [key]: value });
      });
    }
    const w = { AND: andConditions };
    const [result, total] = await Promise.all([
      prisma.payment.findMany({ skip, take: limit, where: w, orderBy: { createdAt: 'desc' }, select: paymentSelect }),
      prisma.payment.count({ where: w }),
    ]);
    return { meta: { total, page, limit }, data: result };
  }) ?? { meta: { total: 0, page, limit }, data: [] });
};

const updatePayment = async (req: Request) => {
  const { id } = req.params; const data = req.body;
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  const result = await prisma.payment.update({ where: { id }, data: {
    userId: data.userId ?? (existing as any).userId,
    subscriptionId: data.subscriptionId ?? (existing as any).subscriptionId,
    amount: data.amount ?? (existing as any).amount,
    currency: data.currency ?? (existing as any).currency,
    status: data.status ?? (existing as any).status,
    paymentMethodType: data.paymentMethodType ?? (existing as any).paymentMethodType,
    cardBrand: data.cardBrand ?? (existing as any).cardBrand,
    cardLast4: data.cardLast4 ?? (existing as any).cardLast4,
    cardExpMonth: data.cardExpMonth ?? (existing as any).cardExpMonth,
    cardExpYear: data.cardExpYear ?? (existing as any).cardExpYear,
    stripeSessionId: data.stripeSessionId ?? (existing as any).stripeSessionId,
    stripePaymentId: data.stripePaymentId ?? (existing as any).stripePaymentId,
    stripeCustomerId: data.stripeCustomerId ?? (existing as any).stripeCustomerId,
  }, select: paymentSelect });
  await CacheInvalidator.onRecordDelete(PAYMENT_MODEL, id, existing.userId);
  return result;
};

const toggleStatusPayment = async (id: string) => {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  return prisma.payment.update({ where: { id }, data: { status: (existing as any).status }, select: paymentSelect });
};

const softDeletePayment = async (id: string) => {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  if ((existing as any).isDeleted) throw new ApiError(httpStatus.BAD_REQUEST, 'Already deleted');
  const result = await prisma.payment.update({ where: { id }, data: {}, select: paymentSelect });
  await CacheInvalidator.onRecordDelete(PAYMENT_MODEL, id, existing.userId);
  return result;
};

const deletePayment = async (id: string) => {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  const result = await prisma.payment.delete({ where: { id } });
  await CacheInvalidator.onRecordDelete(PAYMENT_MODEL, id);
  return result;
};

export const paymentService = { createPayment, getPaymentList, getPaymentById, getMyPayment, updatePayment, toggleStatusPayment, softDeletePayment, deletePayment };