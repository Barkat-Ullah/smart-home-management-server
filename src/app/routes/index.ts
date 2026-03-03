import express from 'express';
import { AuthRouters } from '../modules/Auth/Auth.routes';
import { UserRouters } from '../modules/User/user.routes';
import { FollowRoutes } from '../modules/follow/follow.routes';
import { notificationsRoute } from '../modules/Notifications/Notification.routes';
import { subscriptionRoutes } from '../modules/subscription/subscription.routes';
import { favoriteRoutes } from '../modules/favorite/favorite.routes';
import { paymentRoutes } from "../modules/payment/payment.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/user',
    route: UserRouters,
  },
  {
    path: '/follow',
    route: FollowRoutes,
  },
  {
    path: '/notifications',
    route: notificationsRoute,
  },
  {
    path: '/subscription',
    route: subscriptionRoutes,
  },
  {
    path: '/favorite',
    route: favoriteRoutes,
  },
  {
    path: "/payments",
    route: paymentRoutes,
  },

];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
