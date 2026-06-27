# VR 线上画展部署指南

## 本地开发

```bash
npm install
npx prisma db push
npx tsx scripts/seed.ts   # 写入示例数据
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 1. 环境变量

在 Vercel 项目设置中添加：

```
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL=https://你的域名.vercel.app
```

### 2. 数据库初始化

Vercel 的文件系统是只读的（除了 /tmp）。
首次部署后需要运行 seed 脚本来创建表和示例数据。

方案 A（推荐）：本地生成 db.db 后提交（开发模式可行）
方案 B：改用 Turso（云端 SQLite）- 见下方说明

### 3. 构建

```bash
npm run build
```

## 改用 Turso 云数据库（生产环境推荐）

如果 Vercel 部署后数据库不工作，按以下步骤迁移到 Turso：

1. 注册 https://turso.tech（免费）
2. 创建数据库，获取 connection string 和 auth token
3. 修改 prisma 配置使用 libsql adapter
4. 在 Vercel 设置环境变量
