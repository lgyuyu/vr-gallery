import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

// 全局缓存避免热重载时建立多个连接
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrisma(): PrismaClient {
  // 相对于项目根目录的 dev.db
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
