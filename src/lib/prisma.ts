import { PrismaClient } from '../generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Prisma 7 removed the bare `new PrismaClient()` connection path - every
// database now needs an explicit driver adapter. Neon's adapter talks to
// the database over HTTP/WebSocket rather than a raw TCP connection,
// which is why the pooled connection string matters here (see note below).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // IMPORTANT: this must be the POOLED connection string (hostname
  // contains "-pooler"), not the direct one. The direct string is only
  // for prisma.config.ts / CLI migrations - using it here would exhaust
  // Neon's direct connection limit under real traffic.
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}