import prisma from '../../../utils/prisma';

// Logout frequency per user (for bar/line chart)
export const getUserLogoutStats = async (userId?: string) => {
  const where: any = userId ? { userId } : {};

  const logouts = await prisma.logout.findMany({
    where,
    select: {
      userId: true,
      logoutAt: true,
    },
    orderBy: { logoutAt: 'asc' },
  });

  const userIds = [...new Set(logouts.map(l => l.userId))];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true, email: true },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  const grouped: Record<string, { user: { fullName: string; email: string }; count: number; dates: string[] }> = {};
  for (const log of logouts) {
    if (!grouped[log.userId]) {
      const found = userMap.get(log.userId);
      grouped[log.userId] = {
        user: found ? { fullName: found.fullName, email: found.email } : { fullName: '', email: '' },
        count: 0,
        dates: [],
      };
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

  const raw = await prisma.user.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      count: 0,
    };
  });

  for (const u of raw) {
    const m = u.createdAt.getMonth();
    const y = u.createdAt.getFullYear();
    const bucket = monthly.find(x => x.month === new Date(y, m).toLocaleString('default', { month: 'short' }) && x.year === y);
    if (bucket) bucket.count++;
  }

  const newUsers = monthly.map(({ year, ...rest }) => rest);

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
