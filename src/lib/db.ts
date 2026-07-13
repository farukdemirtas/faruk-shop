import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL environment variable is not set");

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
    max: process.env.NODE_ENV === "production" ? 5 : 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  if (cached && "shopierSettings" in cached) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
