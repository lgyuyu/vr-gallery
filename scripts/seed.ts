import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN ?? undefined,
});
const prisma = new PrismaClient({ adapter });

// 占位画作的SVG生成器 - 创建抽象艺术风格的占位图
function makeArtSVG(seed: number, title: string): string {
  const hues = [(seed * 47) % 360, (seed * 89) % 360, (seed * 137) % 360];
  const h1 = hues[0], h2 = hues[1], h3 = hues[2];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="bg${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${h1},70%,55%)"/>
      <stop offset="100%" stop-color="hsl(${h2},65%,40%)"/>
    </linearGradient>
    <radialGradient id="glow${seed}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="hsl(${h3},80%,70%)" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="hsl(${h3},80%,70%)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg${seed})"/>
  <rect width="800" height="1000" fill="url(#glow${seed})"/>
  <circle cx="${200 + seed*30}" cy="${300 + seed*50}" r="${80 + seed*10}" fill="hsl(${h3},60%,30%)" opacity="0.6"/>
  <circle cx="${600 - seed*20}" cy="${700 - seed*30}" r="${120 - seed*5}" fill="hsl(${(h1+120)%360},50%,40%)" opacity="0.5"/>
  <path d="M 100 ${500 + seed*40} Q 400 ${200 + seed*20} 700 ${600 - seed*30}" stroke="hsl(${h3},90%,80%)" stroke-width="6" fill="none" opacity="0.8"/>
  <text x="400" y="950" text-anchor="middle" font-family="serif" font-size="36" fill="white" opacity="0.9">${title}</text>
</svg>`;
}

async function main() {
  console.log("🌱 开始种子数据...");

  // 清空
  await prisma.painting.deleteMany();
  await prisma.student.deleteMany();
  await prisma.organization.deleteMany();

  // 创建机构
  const org = await prisma.organization.create({
    data: {
      name: "星辰美术",
      subtitle: "学生画展",
      style: "modern",
    },
  });
  console.log("✅ 机构创建:", org.name);

  // 学生数据
  const studentsData = [
    { name: "小雨", age: "8岁", className: "启蒙班", bio: "小雨，8岁，学习画画2年，喜欢画小动物" },
    { name: "乐乐", age: "9岁", className: "进阶班", bio: "乐乐，9岁，最爱用色彩表达心情" },
    { name: "果果", age: "7岁", className: "启蒙班", bio: "果果，7岁，想象力丰富的小画家" },
    { name: "欣欣", age: "10岁", className: "高级班", bio: "欣欣，10岁，学画3年，擅长素描和水彩" },
    { name: "晨晨", age: "8岁", className: "进阶班", bio: "晨晨，8岁，喜欢画风景和自然" },
    { name: "朵朵", age: "9岁", className: "进阶班", bio: "朵朵，9岁，热爱中国传统水墨" },
  ];

  const paintingsTitles = [
    "春日花园", "彩虹之家", "小猫钓鱼", "星空梦", "海底世界",
    "向日葵", "我的朋友", "雨后晴天", "彩色气球", "森林精灵",
  ];

  for (let i = 0; i < studentsData.length; i++) {
    const sd = studentsData[i];
    const student = await prisma.student.create({
      data: {
        name: sd.name,
        age: sd.age,
        className: sd.className,
        bio: sd.bio,
        orgId: org.id,
      },
    });

    // 每个学生 5-7 幅画
    const count = 5 + (i % 3);
    for (let j = 0; j < count; j++) {
      const seed = i * 10 + j;
      const title = paintingsTitles[(i * 3 + j) % paintingsTitles.length];
      const svg = makeArtSVG(seed, title);
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      await prisma.painting.create({
        data: {
          title: `${title}`,
          description: `${sd.name}的作品 · ${sd.className}`,
          createdAt: "2025",
          imageUrl: dataUrl,
          thumbnailUrl: dataUrl,
          order: j,
          studentId: student.id,
        },
      });
    }
    console.log(`  🎨 ${sd.name}: ${count} 幅画作`);
  }

  const totalPaintings = await prisma.painting.count();
  console.log(`\n✅ 完成！机构1个，学生${studentsData.length}个，画作${totalPaintings}幅`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ 种子失败:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
