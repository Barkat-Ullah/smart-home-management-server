import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as analyticsService from '../analytics/analytics.service';
import httpStatus from 'http-status';

export const analyticsController = {
  getDashboardStats: catchAsync(async (req, res) => {
    const data = await analyticsService.getAdminDashboardStats();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Dashboard stats',
      data,
    });
  }),

  getLogoutStats: catchAsync(async (req, res) => {
    const userId = req.query.userId as string | undefined;
    const data = await analyticsService.getUserLogoutStats(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Logout stats',
      data,
    });
  }),

  getLogoutTrend: catchAsync(async (req, res) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await analyticsService.getLogoutTrend(year);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Logout trend',
      data,
    });
  }),

  getMyStats: catchAsync(async (req, res) => {
    const data = await analyticsService.getMyStats(req.user.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My stats',
      data,
    });
  }),
};
