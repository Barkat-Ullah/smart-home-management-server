import express from 'express';
import { FollowRoutes } from '../modules/follow/follow.routes';
import { notificationsRoute } from '../modules/Notifications/Notification.routes';
import { subscriptionRoutes } from '../modules/subscription/subscription.routes';
import { favoriteRoutes } from '../modules/favorite/favorite.routes';
import { paymentRoutes } from '../modules/payment/payment.routes';
import { userRoutes } from '../modules/user/user.routes';
import { analyticsrouter } from '../modules/user/analytics/analytics.routes';
import { authRouters } from '../modules/auth/auth.routes';
import { inventoryRoutes } from "../modules/inventory/inventory.routes";
import { memoryRoutes } from "../modules/memory/memory.routes";
import { feedRoutes } from "../modules/feed/feed.routes";
import { familyMemberRoutes } from "../modules/familyMember/familyMember.routes";
import { childRoutes } from "../modules/child/child.routes";
import { eventRoutes } from "../modules/event/event.routes";


const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRouters,
  },

  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/analytics',
    route: analyticsrouter,
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
    path: '/payments',
    route: paymentRoutes,
  },

  {
    path: "/inventors",
    route: inventoryRoutes,
  },

  {
    path: "/memory",
    route: memoryRoutes,
  },

  {
    path: "/feeds",
    route: feedRoutes,
  },

  {
    path: "/family-members",
    route: familyMemberRoutes,
  },

  {
    path: "/child",
    route: childRoutes,
  },
  {
    path: "/events",
    route: eventRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
