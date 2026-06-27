import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "node:path";
import fs from "node:fs";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getDatabaseUrl(): string {
  // 如果环境变量直接指定了远程数据库 URL（Turso），直接用
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl; // libsql:// 或 https://
  }

  // 本地文件模式
  // 生产环境（Vercel 等）用 /tmp 目录（唯一可写的路径）
  // 开发环境用项目目录
  if (process.env.NODE_ENV === "production") {
    // /tmp 在 serverless 函数执行期间可写
    return "file:/tmp/dev.db";
  }

  // 开发环境：用项目根目录
  const dbPath = path.join(process.cwd(), "dev.db");
  return `file:${dbPath}`;
}

function createPrisma(): PrismaClient {
  const url = getDatabaseUrl();

  // 确保本地开发时文件所在目录存在
  if (url.startsWith("file:") && process.env.NODE_ENV !== "production") {
    const filePath = url.replace("file:", "");
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

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
