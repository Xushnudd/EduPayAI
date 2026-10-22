import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { databaseUrl } from "./env";

const globalForPrisma = globalThis as unknown as { edupayPrisma?: PrismaClient };
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.edupayPrisma) {
    globalForPrisma.edupayPrisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl(), connectionTimeoutMillis: 5000, max: 5 }),
    });
  }
  return globalForPrisma.edupayPrisma;
}
