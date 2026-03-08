import { NotifyType } from '@prisma/client';
import ApiError from '../errors/AppError';
import { prisma } from '../utils/prisma';
import admin from 'firebase-admin';
import { sendSSEToUser, sendSSEToUsers } from './sse';

interface CreateNotificationParams {
  receiverId: string;
  senderId: string | null;
  title: string;
  body: string;
  referenceId: string | null;
  type: NotifyType;
}

// Send push notification
export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
) => {
  if (!fcmToken) return;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    if (error.code === 'messaging/invalid-registration-token') {
      throw new ApiError(400, 'Invalid FCM registration token');
    } else if (error.code === 'messaging/registration-token-not-registered') {
      throw new ApiError(404, 'FCM token is no longer registered');
    } else {
      throw new ApiError(500, error.message || 'Failed to send notification');
    }
  }
};

export const createNotification = async (params: CreateNotificationParams) => {
  const { receiverId, senderId, title, body, referenceId, type } = params;

  const notification = await prisma.notification.create({
    data: {
      receiverId,
      senderId,
      title,
      body,
      referenceId,
      type,
      isRead: false,
    },
    include: {
      sender: {
        select: { id: true, email: true, fullName: true, image: true },
      },
    },
  });

  const unreadCount = await prisma.notification.count({
    where: { receiverId, isRead: false },
  });

  // real-time SSE push
  sendSSEToUser(receiverId, 'notification', { notification, unreadCount });

  // optional FCM push (uncomment when ready)
  // const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { fcmToken: true } });
  // if (receiver?.fcmToken) await sendPushNotification(receiver.fcmToken, title, body);

  return notification;
};

export const createBulkNotifications = async (
  notifications: CreateNotificationParams[],
) => {
  const result = await prisma.notification.createMany({ data: notifications });

  // emit real-time to each unique receiver
  const uniqueReceivers = [...new Set(notifications.map(n => n.receiverId))];

  await Promise.all(
    uniqueReceivers.map(async receiverId => {
      const unreadCount = await prisma.notification.count({
        where: { receiverId, isRead: false },
      });
      sendSSEToUser(receiverId, 'notification:bulk', { unreadCount });
    }),
  );

  return result;
};
