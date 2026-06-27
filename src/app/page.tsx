import Link from "next/link";
import type { Metadata } from "next";
import { getAllStudents, getOrganization } from "@/lib/data";

// 运行时动态渲染（不预构建，因为数据库可能在运行时才有数据）
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "星辰美术 · 学生线上画展",
  description: "360° VR 沉浸式学生作品展示 · 点击进入学生专属展厅",
};

export default async function HomePage() {
  const [students, org] = await Promise.all([getAllStudents(), getOrganization()]);

  if (!org) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-stone-600">系统未初始化</p>
          <p className="text-stone-400 text-sm mt-1">请联系管理员</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100">
      {/* 顶部 Banner */}
      <header className="border-b border-stone-200/60 bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} className="h-9 w-9 rounded" />
            ) : (
              <div className="h-9 w-9 rounded bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white font-serif text-lg">
                {org.name[0]}
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-stone-900 leading-tight">
                {org.name}
              </h1>
              <p className="text-xs text-stone-500 leading-tight">{org.subtitle}</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-xs sm:text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            管理后台
          </Link>
        </div>
      </header>

      {/* 主标题 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-10 text-center">
        <p className="text-amber-700 text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 font-medium">
          Online Art Gallery
        </p>
        <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-4 leading-tight">
          每一位孩子，<br className="sm:hidden" />
          都值得一场专属画展
        </h2>
        <p className="text-stone-500 text-sm sm:text-base max-w-xl mx-auto">
          360° 全景沉浸式展厅，点击进入，自由漫游孩子们的艺术世界。
        </p>
      </section>

      {/* 学生卡片网格 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {students.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            暂无学生展厅
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {students.map((s, i) => (
              <Link
                key={s.id}
                href={`/gallery/${s.id}`}
                className="group block animate-[fadeInUp_0.5s_ease-out]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 group-hover:-translate-y-1">
                  {/* 代表画 */}
                  <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                    {s.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.coverImage}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    {/* 渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    {/* 进入按钮 */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/95 backdrop-blur text-stone-900 text-xs px-3 py-1.5 rounded-full font-medium shadow">
                        进入展厅 →
                      </span>
                    </div>
                  </div>
                  {/* 信息 */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-tight">
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                      {s.age && <span>{s.age}</span>}
                      {s.age && s.className && <span>·</span>}
                      {s.className && <span>{s.className}</span>}
                    </div>
                    {s.bio && (
                      <p className="text-xs text-stone-400 mt-1.5 line-clamp-1">
                        {s.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 页脚 */}
      <footer className="border-t border-stone-200/60 py-6 text-center text-xs text-stone-400">
        <p>© 2025 {org.name} · VR线上画展</p>
      </footer>
    </main>
  );
}
