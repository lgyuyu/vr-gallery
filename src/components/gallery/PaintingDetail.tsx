"use client";

import { useState, useEffect } from "react";
import { useGalleryStore } from "@/store/gallery";

/**
 * 画作详情浮层：点击画作后弹出
 */
export function PaintingDetail() {
  const painting = useGalleryStore((s) => s.selectedPainting);
  const selectPainting = useGalleryStore((s) => s.selectPainting);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ESC 关闭
  useEffect(() => {
    if (!painting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectPainting(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [painting, selectPainting]);

  // 重置缩放
  useEffect(() => {
    if (painting) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [painting?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!painting) return null;

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={() => selectPainting(null)}
    >
      {/* 关闭按钮 */}
      <button
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-colors z-10"
        onClick={(e) => {
          e.stopPropagation();
          selectPainting(null);
        }}
        aria-label="关闭"
      >
        ×
      </button>

      {/* 重置按钮（缩放后显示） */}
      {scale !== 1 && (
        <button
          className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            reset();
          }}
        >
          重置
        </button>
      )}

      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "none" }}
      >
        {/* 高清大图（支持拖动） */}
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl"
          style={{
            maxWidth: "90vw",
            maxHeight: "75vh",
            cursor: dragging ? "grabbing" : "grab",
          }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            setDragging(true);
            setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
          }}
          onPointerMove={(e) => {
            if (!dragging) return;
            setOffset({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y,
            });
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={painting.imageUrl}
            alt={painting.title ?? "画作"}
            draggable={false}
            className="select-none"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: dragging ? "none" : "transform 0.2s",
              maxWidth: "90vw",
              maxHeight: "75vh",
              width: "auto",
              height: "auto",
            }}
          />
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-3 bg-white/10 rounded-full px-2 py-1">
          <button
            className="w-9 h-9 rounded-full hover:bg-white/20 text-white text-xl"
            onClick={(e) => {
              e.stopPropagation();
              setScale((s) => Math.max(0.3, s - 0.2));
            }}
          >
            −
          </button>
          <span className="text-white text-sm w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            className="w-9 h-9 rounded-full hover:bg-white/20 text-white text-xl"
            onClick={(e) => {
              e.stopPropagation();
              setScale((s) => Math.min(4, s + 0.2));
            }}
          >
            +
          </button>
        </div>

        {/* 画作信息 */}
        <div className="text-center text-white max-w-2xl">
          {painting.title && (
            <h3 className="text-xl sm:text-2xl font-serif font-medium mb-1">
              {painting.title}
            </h3>
          )}
          <div className="flex items-center justify-center gap-3 text-sm text-white/70">
            {painting.createdAt && <span>{painting.createdAt}</span>}
          </div>
          {painting.description && (
            <p className="text-sm sm:text-base text-white/80 mt-2 leading-relaxed">
              {painting.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
