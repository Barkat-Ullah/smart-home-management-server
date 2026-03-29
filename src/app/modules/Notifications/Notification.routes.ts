import express from 'express';
import auth from '../../middlewares/auth';
import { notificationController } from './notification.controller';


const router = express.Router();

router.post(
  '/send-notification/:userId',
  auth(),
  notificationController.sendNotification,
);
router.post(
  '/send-notification',
  auth(),
  notificationController.sendNotifications,
);
// SSE — must be before /:notificationId to avoid conflict
router.get('/subscribe', auth(), notificationController.subscribe);

router.get('/my', auth(), notificationController.getMyNotification);
router.get('/', auth(), notificationController.getNotifications);
router.get(
  '/:notificationId',
  auth(),
  notificationController.getSingleNotificationById,
);

export const notificationsRoute = router;
