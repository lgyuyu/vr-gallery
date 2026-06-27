# 🎨 VR 线上画展

为美术培训机构打造的学生 VR 线上画展平台。每个学生拥有独立的 3D 虚拟展厅，家长通过手机即可 360° 沉浸式浏览孩子的画作。

## ✨ 功能

- 🏛️ **3D 虚拟展厅** — 360° 全景漫游，第一人称行走
- 🎭 **两种风格** — 现代简约白墙画廊 / 温馨家居
- 🖼️ **画作展示** — 聚光灯照射、真实画框、点击查看高清大图
- 📱 **手机适配** — 触摸滑动视角、虚拟摇杆移动
- 🔗 **微信分享** — 一键生成专属分享链接
- ⚙️ **管理后台** — 学生管理、画作上传、风格切换

## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + React 19 + TypeScript |
| 3D 渲染 | Three.js + React Three Fiber |
| UI 样式 | Tailwind CSS 4 |
| 数据库 | SQLite + Prisma 7 |
| 状态管理 | Zustand |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 10+

### 安装

```bash
git clone https://github.com/lgyuyu/vr-gallery.git
cd vr-gallery
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

### 初始化数据库

```bash
npx prisma db push
npx tsx scripts/seed.ts
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 页面说明

| 路径 | 说明 |
|------|------|
| `/` | 展厅大厅（学生列表） |
| `/gallery/[studentId]` | 学生 3D 展厅 |
| `/admin` | 管理后台 |

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 首页（学生列表）
│   ├── gallery/[studentId]/# 3D 展厅页面
│   └── admin/              # 管理后台
├── components/
│   ├── three/              # 3D 场景组件
│   │   ├── GalleryScene.tsx
│   │   ├── Room.tsx        # 房间
│   │   ├── PaintingOnWall.tsx
│   │   └── FirstPersonControls.tsx
│   └── gallery/            # 2D UI 组件
├── lib/                    # 工具库
│   ├── prisma.ts           # 数据库
│   ├── data.ts             # 数据访问
│   ├── styles.ts           # 风格配置
│   └── wall-layout.ts      # 画作布局算法
└── store/                  # Zustand 状态
```

## 📄 License

MIT
