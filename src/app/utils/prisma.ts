import { PrismaClient } from '@prisma/client';

// Single PrismaClient instance — one connection pool
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

// Both exports point to the same client — no dual connection pool
// `insecurePrisma` name serves as a documentation hint:
// "this query intentionally accesses sensitive fields like password/OTP"
export const prisma = prismaClient;
export const insecurePrisma = prismaClient;

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Disconnecting Prisma...`);
  await prisma.$disconnect();
  console.log('Prisma disconnected.');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // docker stop

export default prisma;
