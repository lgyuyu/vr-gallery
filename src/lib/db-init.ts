import { prisma } from "./prisma";

let initialized = false;

/**
 * 确保数据库已初始化（有表 + 有数据）
 * 在 serverless 环境中，每次冷启动都会检查
 */
export async function ensureDBInitialized() {
  if (initialized) return;

  try {
    // 尝试查询，看表是否存在
    await prisma.organization.count();
    initialized = true;
  } catch (e: any) {
    // 表不存在或数据库未初始化
    console.log("[DB] 初始化数据库...");
    await initDB();
    initialized = true;
  }
}

async function initDB() {
  // 执行建表 SQL（libsql 原生）
  const statements = [
    `CREATE TABLE IF NOT EXISTS "Organization" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "logo" TEXT,
      "subtitle" TEXT NOT NULL DEFAULT '学生画展',
      "style" TEXT NOT NULL DEFAULT 'modern',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Student" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "age" TEXT,
      "className" TEXT,
      "bio" TEXT,
      "style" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "orgId" TEXT NOT NULL,
      FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Painting" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT,
      "description" TEXT,
      "createdAt" TEXT,
      "imageUrl" TEXT NOT NULL,
      "thumbnailUrl" TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      "studentId" TEXT NOT NULL,
      "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE
    )`,
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {
      // 表可能已存在
    }
  }

  // 写入种子数据
  const existing = await prisma.organization.count();
  if (existing === 0) {
    await seedData();
  }
  console.log("[DB] 初始化完成");
}

async function seedData() {
  const { seedGallery } = await import("./seed-data");
  await seedGallery(prisma);
}
