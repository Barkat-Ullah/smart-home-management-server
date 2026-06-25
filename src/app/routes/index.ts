import express from 'express';
import { FollowRoutes } from '../modules/follow/follow.routes';
import { subscriptionRoutes } from '../modules/subscription/subscription.routes';
import { favoriteRoutes } from '../modules/favorite/favorite.routes';
import { paymentRoutes } from '../modules/payment/payment.routes';
import { userRoutes } from '../modules/user/user.routes';
import { analyticsrouter } from '../modules/user/analytics/analytics.routes';
import { authRouters } from '../modules/auth/auth.routes';
import { inventoryRoutes } from '../modules/inventory/inventory.routes';
import { memoryRoutes } from '../modules/memory/memory.routes';
import { feedRoutes } from '../modules/feed/feed.routes';
import { familyMemberRoutes } from '../modules/familyMember/familyMember.routes';
import { childRoutes } from '../modules/child/child.routes';
import { eventRoutes } from '../modules/event/event.routes';
import { financialRoutes } from '../modules/financial/financial.routes';
import { prescriptionRoutes } from '../modules/prescription/prescription.routes';
import { reminderRoutes } from '../modules/medicineReminder/medicineReminder.routes';
import { doseLogRoutes } from '../modules/doseLog/doseLog.routes';
import { medicineScheduleRoutes } from '../modules/medicineSchedule/medicineSchedule.routes';
import { mealRoutes } from '../modules/meal/meal.routes';
import { weeklyMealPlanRoutes } from '../modules/weeklyMealPlan/weeklyMealPlan.routes';
import { mealPlanDayRoutes } from '../modules/mealPlanDay/mealPlanDay.routes';
import { mealPlanDayItemRoutes } from '../modules/mealPlanDayItem/mealPlanDayItem.routes';
import { aiRoutes } from '../ai/ai.routes';
import { articleRoutes } from '../modules/article/article.routes';
import { houseroomRoutes } from '../modules/houseroom/houseroom.routes';
import { smartDeviceRoutes } from '../modules/smartDevice/smartDevice.routes';
import { airConditionerRoutes } from '../modules/airConditioner/airConditioner.routes';
import { cctvCameraRoutes } from '../modules/cctvCamera/cctvCamera.routes';
import { notificationsRoute } from '../modules/notifications/notification.routes';
import { cvRoute } from '../cv/cv.route';
import {
  apiAccessTokenMiddleware,
  apiKeyMiddleware,
} from '../middlewares/secureApi';

const router = express.Router();

const secureApiLayer = [apiKeyMiddleware, apiAccessTokenMiddleware];

// x-api-key: your_api_key
// x-api-access-token: your_access_token

type ModuleRoute = {
  path: string;
  route: express.Router;
  secure?: boolean;
};

const moduleRoutes: ModuleRoute[] = [
  {
    path: '/cv',
    route: cvRoute,
    secure: true,
  },
  {
    path: '/ask',
    route: aiRoutes,
    secure: true,
  },
  {
    path: '/auth',
    route: authRouters,
    secure: false, // public — login/register needs no token
  },
  {
    path: '/users',
    route: userRoutes,
    secure: true,
  },
  {
    path: '/analytics',
    route: analyticsrouter,
    secure: true,
  },
  {
    path: '/follow',
    route: FollowRoutes,
    secure: true,
  },
  {
    path: '/notifications',
    route: notificationsRoute,
    secure: true,
  },
  {
    path: '/subscription',
    route: subscriptionRoutes,
    secure: true,
  },
  {
    path: '/favorite',
    route: favoriteRoutes,
    secure: true,
  },
  {
    path: '/payments',
    route: paymentRoutes,
    secure: true,
  },
  {
    path: '/inventors',
    route: inventoryRoutes,
    secure: true,
  },
  {
    path: '/memory',
    route: memoryRoutes,
    secure: true,
  },
  {
    path: '/feeds',
    route: feedRoutes,
    secure: true,
  },
  {
    path: '/family-members',
    route: familyMemberRoutes,
    secure: true,
  },
  {
    path: '/child',
    route: childRoutes,
    secure: true,
  },
  {
    path: '/events',
    route: eventRoutes,
    secure: true,
  },
  {
    path: '/financial',
    route: financialRoutes,
    secure: true,
  },
  {
    path: '/prescriptions',
    route: prescriptionRoutes,
    secure: true,
  },
  {
    path: '/schedules',
    route: medicineScheduleRoutes,
    secure: true,
  },
  {
    path: '/doses',
    route: doseLogRoutes,
    secure: true,
  },
  {
    path: '/reminders',
    route: reminderRoutes,
    secure: true,
  },
  {
    path: '/meals',
    route: mealRoutes,
    secure: true,
  },
  {
    path: '/weekly-meal-plans',
    route: weeklyMealPlanRoutes,
    secure: true,
  },
  {
    path: '/meal-plan-days',
    route: mealPlanDayRoutes,
    secure: true,
  },
  {
    path: '/meal-items',
    route: mealPlanDayItemRoutes,
    secure: true,
  },
  {
    path: '/article',
    route: articleRoutes,
    secure: false, // public — articles readable without token
  },
  {
    path: '/houserooms',
    route: houseroomRoutes,
    secure: true,
  },
  {
    path: '/smart-devices',
    route: smartDeviceRoutes,
    secure: true,
  },
  {
    path: '/air-conditioners',
    route: airConditionerRoutes,
    secure: true,
  },
  {
    path: '/cctv-cameras',
    route: cctvCameraRoutes,
    secure: true,
  },
];

moduleRoutes.forEach(({ path, route, secure }) => {
  if (secure) {
    router.use(path, ...secureApiLayer, route);
  } else {
    router.use(path, route);
  }
});

export default router;
