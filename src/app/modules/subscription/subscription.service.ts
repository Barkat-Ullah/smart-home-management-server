import httpStatus from 'http-status';
import {
  DurationType,
  NotifyType,
  PaymentStatus,
  PLanType,
  Prisma,
  UserRoleEnum,
  UserStatus,
} from '@prisma/client';
import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../utils/calculatePagination';
import ApiError from '../../errors/AppError';
import { Request } from 'express';
import { toStringArray } from './plan.constant';
import { createNotification } from '../../utils/notify';


// create Subscription
const createSubscription = async (req: Request) => {
  console.log('');
};

// get all Subscription
type ISubscriptionFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
};

const subscriptionSearchAbleFields = ['title'];

const getSubscriptionList = async (
  options: IPaginationOptions,
  filters: ISubscriptionFilterRequest,
) => {

  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.SubscriptionWhereInput[] = [{ isDeleted: false }];

  if (searchTerm) {
    andConditions.push({
      OR: [
        ...subscriptionSearchAbleFields.map(field => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        })),
      ],
    });
  }

  if (Object.keys(filterData).length) {
    Object.keys(filterData).forEach(key => {
      const value = (filterData as any)[key];
      if (value === '' || value === null || value === undefined) return;

      if (key === 'createdAt' && value) {
        const parts = (value as string).split('-');

        if (parts.length === 2) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;

          const start = new Date(year, month, 1, 0, 0, 0, 0);
          const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

          andConditions.push({
            createdAt: {
              gte: start.toISOString(),
              lte: end.toISOString(),
            },
          });
        } else {
          const start = new Date(value);
          start.setHours(0, 0, 0, 0);
          const end = new Date(value);
          end.setHours(23, 59, 59, 999);

          andConditions.push({
            createdAt: {
              gte: start.toISOString(),
              lte: end.toISOString(),
            },
          });
        }
        return;
      }
      if (key.includes('.')) {
        const [relation, field] = key.split('.');
        andConditions.push({
          [relation]: {
            some: { [field]: value },
          },
        });
        return;
      }
      // if (key === 'tier') {
      //   const tiers = Array.isArray(value) ? value : [value];
      //   andConditions.push({
      //     tier: { in: tiers },
      //   });
      //   return;
      // }

      andConditions.push({
        [key]: value,
      });
    });
  }

  const whereConditions: Prisma.SubscriptionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.subscription.findMany({
    skip,
    take: limit,
    where: whereConditions,
    select: {
      id: true,
      title: true,
      amount: true,
      duration: true,
      isDeleted: true,
      features: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.subscription.count({ where: whereConditions });

  const totalUser = await prisma.user.count();
  const totalPaidUser = await prisma.user.count({
    where: {
      status: UserStatus.ACTIVE,
      plan: PLanType.Paid,
    },
  });

  const response = {
    meta: { total, page, limit, totalUser, totalPaidUser },
    data: result,
  };


  return response;
};

type IUserSubscriptionFilterRequest = {
  searchTerm?: string;
  id?: string;
  createdAt?: string;
};

const userSubscriptionSearchAbleFields = ['fullName', 'email', ];

const getUserSubscriptionList = async (
  options: IPaginationOptions,
  filters: IUserSubscriptionFilterRequest,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.UserSubscriptionWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        ...userSubscriptionSearchAbleFields.map(field => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        })),
      ],
    });
  }

  if (Object.keys(filterData).length) {
    Object.keys(filterData).forEach(key => {
      const value = (filterData as any)[key];
      if (value === '' || value === null || value === undefined) return;

      if (key === 'createdAt' && value) {
        const parts = (value as string).split('-');

        if (parts.length === 2) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;

          const start = new Date(year, month, 1, 0, 0, 0, 0);
          const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

          andConditions.push({
            createdAt: {
              gte: start.toISOString(),
              lte: end.toISOString(),
            },
          });
        } else {
          const start = new Date(value);
          start.setHours(0, 0, 0, 0);
          const end = new Date(value);
          end.setHours(23, 59, 59, 999);

          andConditions.push({
            createdAt: {
              gte: start.toISOString(),
              lte: end.toISOString(),
            },
          });
        }
        return;
      }
      if (key.includes('.')) {
        const [relation, field] = key.split('.');
        andConditions.push({
          [relation]: {
            some: { [field]: value },
          },
        });
        return;
      }
      // if (key === "tier") {
      //   const tiers = Array.isArray(value) ? value : [value];
      //   andConditions.push({
      //     tier: { in: tiers },
      //   });
      //   return;
      // }

      andConditions.push({
        [key]: value,
      });
    });
  }

  const whereConditions: Prisma.UserSubscriptionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.userSubscription.findMany({
    skip,
    take: limit,
    where: whereConditions,
    select: {
      id: true,
      amount: true,
      startDate: true,
      endDate: true,

      subscription: {
        select: {
          title: true,
          duration: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // calculate status based on endDate
  const getSubscriptionStatus = (endDate: Date | null) => {
    if (!endDate) return 'Active';

    const now = new Date();
    const end = new Date(endDate);
    const diffInDays = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays < 0) return 'Expired';
    if (diffInDays <= 7) return 'Expiring Soon';
    return 'Active';
  };

  const enrichedResult = result.map(item => ({
    id: item.id,
    // userId: item.user.id,
    // fullName: item.user.fullName,
    // image: item.user.primaryImage,
    amount: item.amount,
    startDate: item.startDate,
    expiryDate: item.endDate,
    status: getSubscriptionStatus(item.endDate),
  }));

  const total = await prisma.userSubscription.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: enrichedResult,
  };
};

// get Subscription by id
const getSubscriptionById = async (id: string) => {

  const result = await prisma.subscription.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,

      amount: true,
      duration: true,
      isDeleted: true,

      features: true,
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  return result;
};

// update Subscription
const updateSubscription = async (req: Request) => {
  const { id } = req.params;
  const data = req.body;

  const existingSubscription = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!existingSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  const incomingFeatures =
    data.feature ?? data.features ?? data.features ?? null;

  let featuresToSave: string[] = [];

  if (incomingFeatures !== null && incomingFeatures !== undefined) {
    featuresToSave = toStringArray(incomingFeatures);
  }

  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
  if (data.duration !== undefined) updateData.duration = data.duration;

  if (featuresToSave.length > 0) {
    updateData.features = featuresToSave;
  }

  const result = await prisma.subscription.update({
    where: { id },
    data: updateData,
  });

  return result;
};

// delete Subscription
const deleteSubscription = async (id: string) => {
  const result = await prisma.subscription.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

const getMyPlan = async (req: Request) => {
  const plan = await prisma.userSubscription.findFirst({
    where: {
      userId: req.user.id,
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      subscription: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  if (!plan) {
    throw new ApiError(404, 'You do not have any pan');
  }
  return plan;
};

const updateInAppPurchasePlanData = async (req: Request) => {
  const userId = req.user.id;
  const {
    subscriptionId,
    amount,
    subscriptionStart,
    subscriptionEnd,
    currency = 'usd',
  } = req.body;

  if (!subscriptionId || !amount || !subscriptionStart || !subscriptionEnd) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }


  const result = await prisma.$transaction(async tx => {
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });

    if (!currentUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }

    const updatedSubscription = await tx.userSubscription.upsert({
      where: {
        userId_subscriptionId: { userId, subscriptionId },
      },
      create: {
        userId,
        subscriptionId,
        amount,
        startDate: new Date(subscriptionStart),
        endDate: new Date(subscriptionStart),
      },
      update: {
        subscription: { connect: { id: subscriptionId } },
        startDate: new Date(subscriptionStart),
        endDate: new Date(subscriptionStart),
        amount,
      },
    });

    const payment = await tx.payment.create({
      data: {
        userId,
        subscriptionId,
        amount,
        currency,
        status: PaymentStatus.SUCCESS,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { plan: PLanType.Paid },
    });

    return { updatedSubscription, payment, currentUser };
  });

  // fetch admin outside transaction
  const admin = await prisma.user.findFirst({
    where: { role: UserRoleEnum.ADMIN },
    select: { id: true },
  });

  // fetch subscription title for notification message
  // const subscription = await prisma.subscription.findUnique({
  //   where: { id: subscriptionId },
  //   select: { title: true, duration: true },
  // });

  const planLabel = `${subscription?.title} (${subscription?.duration})`;

  // notify user — payment success
  await createNotification({
    receiverId: userId,
    senderId: admin?.id ?? null,
    title: 'Payment Successful 🎉',
    body: `Your ${planLabel} subscription has been activated. Amount charged: $${amount}.`,
    referenceId: result.payment.id,
    type: NotifyType.Payment,
  });

  // notify admin — new payment received
  if (admin) {
    await createNotification({
      receiverId: admin.id,
      senderId: userId,
      title: 'New Subscription Payment',
      body: `${result.currentUser.fullName} has subscribed to ${planLabel} for $${amount}.`,
      referenceId: result.payment.id,
      type: NotifyType.Payment,
    });
  }

  return {
    message: 'Subscription updated successfully!',
    subscription: result.updatedSubscription,
    currentUser: result.currentUser,
  };
};

const cancelPlan = async (req: Request) => {
  const userId = req.user.id;

  const currentPlan = await prisma.userSubscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { subscription: true },
  });

  if (!currentPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No active plan found');
  }

  const result = await prisma.userSubscription.delete({
    where: { id: currentPlan.id },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      plan: PLanType.Free,
    },
  });

  return {
    message: 'Plan cancelled',
    plan: result,
  };
};

export const subscriptionService = {
  createSubscription,
  getSubscriptionList,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelPlan,
  updateInAppPurchasePlanData,
  getMyPlan,
  getUserSubscriptionList,
};
