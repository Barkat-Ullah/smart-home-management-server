import auth from '../../../middlewares/auth';
import { analyticsController } from './analytics.controller';
import express from 'express';

const router = express.Router();
router.get(
  '/admin/dashboard-stats',
  auth('ADMIN'),
  analyticsController.getDashboardStats,
);
router.get(
  '/admin/logout-stats',
  auth('ADMIN'),
  analyticsController.getLogoutStats,
);
router.get(
  '/admin/logout-trend',
  auth('ADMIN'),
  analyticsController.getLogoutTrend,
);
router.get('/my/stats', auth(), analyticsController.getMyStats);
export const analyticsrouter = router;
