import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrisma(): PrismaClient {
  // 支持的 URL 格式：
  //   - file:./dev.db   （本地 SQLite 文件，开发用）
  //   - libsql://xxx    （Turso 远程数据库，生产用）
  //   - https://xxx     （Turso HTTP 端点）
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  const adapter = new PrismaLibSql({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN ?? undefined,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
