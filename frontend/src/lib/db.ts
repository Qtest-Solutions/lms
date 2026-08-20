import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const RETRIABLE_CODES = new Set(["P1001", "P1008", "P1017", "P2024"]);
const MAX_ATTEMPTS = 3;

function retryMiddleware(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) {
  const attempt = (n: number): Promise<unknown> =>
    next(params).catch(async (err: unknown) => {
      const code = (err as { code?: string } | null)?.code;
      if (!code || !RETRIABLE_CODES.has(code) || n >= MAX_ATTEMPTS) throw err;
      await new Promise((r) => setTimeout(r, 400 * n));
      return attempt(n + 1);
    });
  return attempt(1);
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (!globalForPrisma.prisma) {
  prisma.$use(retryMiddleware);
  globalForPrisma.prisma = prisma;
}

export { Prisma };
