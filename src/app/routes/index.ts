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
import { notificationsRoute } from '../modules/notifications/notification.routes';
import { houseroomRoutes } from '../modules/houseroom/houseroom.routes';
import { smartDeviceRoutes } from '../modules/smartDevice/smartDevice.routes';
import { airConditionerRoutes } from '../modules/airConditioner/airConditioner.routes';
import { cctvCameraRoutes } from '../modules/cctvCamera/cctvCamera.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/ask',
    route: aiRoutes,
  },
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
    path: '/inventors',
    route: inventoryRoutes,
  },
  {
    path: '/memory',
    route: memoryRoutes,
  },
  {
    path: '/feeds',
    route: feedRoutes,
  },
  {
    path: '/family-members',
    route: familyMemberRoutes,
  },
  {
    path: '/child',
    route: childRoutes,
  },
  {
    path: '/events',
    route: eventRoutes,
  },
  {
    path: '/financial',
    route: financialRoutes,
  },
  //*medicine management
  {
    path: '/prescriptions',
    route: prescriptionRoutes,
  },
  { path: '/schedules', route: medicineScheduleRoutes },
  { path: '/doses', route: doseLogRoutes },
  { path: '/reminders', route: reminderRoutes },
  //*meal management
  {
    path: '/meals',
    route: mealRoutes,
  },
  {
    path: '/weekly-meal-plans',
    route: weeklyMealPlanRoutes,
  },
  {
    path: '/meal-plan-days',
    route: mealPlanDayRoutes,
  },
  {
    path: '/meal-items',
    route: mealPlanDayItemRoutes,
  },
  {
    path: '/article',
    route: articleRoutes,
  },
  //*house related
  {
    path: '/houserooms',
    route: houseroomRoutes,
  },
  {
    path: '/smart-devices',
    route: smartDeviceRoutes,
  },
  {
    path: '/air-conditioners',
    route: airConditionerRoutes,
  },
  {
    path: '/cctv-cameras',
    route: cctvCameraRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
