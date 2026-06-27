import { apiAccessTokenMiddleware, apiKeyMiddleware } from '../middlewares/secureApi';
import * as Routes from './imports';
import express from 'express';
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
    route: Routes.cvRoute,
    secure: true,
  },
  {
    path: '/ask',
    route: Routes.aiRoutes,
    secure: true,
  },
  {
    path: '/auth',
    route: Routes.authRouters,
    secure: false, // public — login/register needs no token
  },
  {
    path: '/users',
    route: Routes.userRoutes,
    secure: true,
  },
  {
    path: '/analytics',
    route: Routes.analyticsrouter,
    secure: true,
  },
  {
    path: '/follow',
    route: Routes.FollowRoutes,
    secure: true,
  },
  {
    path: '/notifications',
    route: Routes.notificationsRoute,
    secure: true,
  },
  {
    path: '/subscription',
    route: Routes.subscriptionRoutes,
    secure: true,
  },
  {
    path: '/favorite',
    route: Routes.favoriteRoutes,
    secure: true,
  },
  {
    path: '/payments',
    route: Routes.paymentRoutes,
    secure: true,
  },
  {
    path: '/inventors',
    route: Routes.inventoryRoutes,
    secure: true,
  },
  {
    path: '/memory',
    route: Routes.memoryRoutes,
    secure: true,
  },
  {
    path: '/feeds',
    route: Routes.feedRoutes,
    secure: true,
  },
  {
    path: '/family-members',
    route: Routes.familyMemberRoutes,
    secure: true,
  },
  {
    path: '/child',
    route: Routes.childRoutes,
    secure: true,
  },
  {
    path: '/events',
    route: Routes.eventRoutes,
    secure: true,
  },
  {
    path: '/financial',
    route: Routes.financialRoutes,
    secure: true,
  },
  {
    path: '/prescriptions',
    route: Routes.prescriptionRoutes,
    secure: true,
  },
  {
    path: '/schedules',
    route: Routes.medicineScheduleRoutes,
    secure: true,
  },
  {
    path: '/doses',
    route: Routes.doseLogRoutes,
    secure: true,
  },
  {
    path: '/reminders',
    route: Routes.reminderRoutes,
    secure: true,
  },
  {
    path: '/meals',
    route: Routes.mealRoutes,
    secure: true,
  },
  {
    path: '/weekly-meal-plans',
    route: Routes.weeklyMealPlanRoutes,
    secure: true,
  },
  {
    path: '/meal-plan-days',
    route: Routes.mealPlanDayRoutes,
    secure: true,
  },
  {
    path: '/meal-items',
    route: Routes.mealPlanDayItemRoutes,
    secure: true,
  },
  {
    path: '/article',
    route: Routes.articleRoutes,
    secure: false, // public — articles readable without token
  },
  {
    path: '/houserooms',
    route: Routes.houseroomRoutes,
    secure: true,
  },
  {
    path: '/smart-devices',
    route: Routes.smartDeviceRoutes,
    secure: true,
  },
  {
    path: '/air-conditioners',
    route: Routes.airConditionerRoutes,
    secure: true,
  },
  {
    path: '/cctv-cameras',
    route: Routes.cctvCameraRoutes,
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
