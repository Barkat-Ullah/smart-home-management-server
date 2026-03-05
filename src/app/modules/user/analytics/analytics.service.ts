import prisma from '../../../utils/prisma';

// Logout frequency per user (for bar/line chart)
export const getUserLogoutStats = async (userId?: string) => {
  const where = userId ? { userId } : {};

  const logouts = await prisma.logout.findMany({
    where,
    select: {
      userId: true,
      logoutAt: true,
      user: { select: { fullName: true, email: true } },
    },
    orderBy: { logoutAt: 'asc' },
  });

  // Group by userId
  const grouped: Record<string, { user: any; count: number; dates: string[] }> =
    {};
  for (const log of logouts) {
    if (!grouped[log.userId]) {
      grouped[log.userId] = { user: log.user, count: 0, dates: [] };
    }
    grouped[log.userId].count++;
    grouped[log.userId].dates.push(log.logoutAt.toISOString());
  }

  return Object.entries(grouped).map(([userId, data]) => ({
    userId,
    ...data,
  }));
};

// Logout trend over time (monthly, for line chart)
export const getLogoutTrend = async (year: number) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const logouts = await prisma.logout.findMany({
    where: { logoutAt: { gte: start, lte: end } },
    select: { logoutAt: true },
  });

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i).toLocaleString('default', { month: 'short' }),
    count: 0,
  }));

  for (const log of logouts) {
    monthly[log.logoutAt.getMonth()].count++;
  }

  return monthly;
};

// Admin dashboard summary
export const getAdminDashboardStats = async () => {
  const [totalUsers, activeUsers, suspendedUsers, paidUsers, totalLogouts] =
    await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      prisma.user.count({ where: { status: 'SUSPENDED', isDeleted: false } }),
      prisma.user.count({ where: { plan: 'Paid', isDeleted: false } }),
      prisma.logout.count(),
    ]);

  // New users per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const newUsers = await prisma.user.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: sixMonthsAgo } },
    _count: true,
  });

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    paidUsers,
    freeUsers: totalUsers - paidUsers,
    totalLogouts,
    newUsers,
  };
};

// User's own activity stats
export const getMyStats = async (userId: string) => {
  const [logoutCount, lastLogout] = await Promise.all([
    prisma.logout.count({ where: { userId } }),
    prisma.logout.findFirst({
      where: { userId },
      orderBy: { logoutAt: 'desc' },
      select: { logoutAt: true },
    }),
  ]);

  return { logoutCount, lastLogout: lastLogout?.logoutAt ?? null };
};
