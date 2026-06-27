"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { PaintingDetail } from "@/components/gallery/PaintingDetail";
import { GalleryOverlay } from "@/components/gallery/GalleryOverlay";
import { useGalleryStore } from "@/store/gallery";
import type { PaintingData, GalleryStyle } from "@/lib/types";

// 3D场景必须客户端加载（依赖 WebGL）
const GalleryScene = dynamic(
  () =>
    import("@/components/three/GalleryScene").then((m) => m.GalleryScene),
  { ssr: false }
);

interface GalleryClientProps {
  studentName: string;
  studentBio: string | null;
  paintings: PaintingData[];
  style: GalleryStyle;
  orgName: string;
  shareUrl: string;
}

export default function GalleryClient({
  studentName,
  studentBio,
  paintings,
  style,
  orgName,
  shareUrl,
}: GalleryClientProps) {
  const setLoading = useGalleryStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(true);
    return () => setLoading(true);
  }, [setLoading]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Canvas */}
      <GalleryScene
        paintings={paintings}
        style={style}
        studentName={studentName}
      />

      {/* 顶部返回栏 */}
      <header className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between p-4 sm:p-5">
          <a
            href="/"
            className="pointer-events-auto inline-flex items-center gap-2 bg-black/45 backdrop-blur-md text-white px-3 py-2 rounded-lg text-sm hover:bg-black/65 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            返回大厅
          </a>

          <div className="pointer-events-auto bg-black/45 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <span className="font-medium">{studentName}</span>
            <span className="text-white/50">·</span>
            <span className="text-white/80">{orgName}</span>
          </div>

          <ShareButton
            studentName={studentName}
            orgName={orgName}
            shareUrl={shareUrl}
          />
        </div>
      </header>

      {/* UI 叠加层 */}
      <GalleryOverlay />

      {/* 画作详情浮层 */}
      <PaintingDetail />
    </div>
  );
}

function ShareButton({
  studentName,
  orgName,
  shareUrl,
}: {
  studentName: string;
  orgName: string;
  shareUrl: string;
}) {
  const onShare = async () => {
    const shareData = {
      title: `${studentName}的线上画展`,
      text: `${orgName} · 学生作品展示`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("链接已复制，快去分享给好友吧！");
      }
    } catch {
      // 用户取消分享
    }
  };

  return (
    <button
      className="pointer-events-auto inline-flex items-center gap-2 bg-amber-700/90 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
      onClick={onShare}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 6L12 2L8 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2V15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      分享
    </button>
  );
}
