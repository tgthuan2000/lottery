import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: import.meta.env.DEV ? ["query", "error", "warn"] : ["error"],
  });

if (!import.meta.env.PROD) globalForPrisma.prisma = db;
