"use client";

import { useEffect, useState } from "react";
import { useGalleryStore } from "@/store/gallery";

/**
 * 3D场景上方的UI叠加层：
 * - 加载状态
 * - 帮助提示
 * - 移动端虚拟摇杆
 */
export function GalleryOverlay() {
  const loading = useGalleryStore((s) => s.loading);
  const showHelp = useGalleryStore((s) => s.showHelp);
  const toggleHelp = useGalleryStore((s) => s.toggleHelp);
  const mobileControls = useGalleryStore((s) => s.mobileControls);
  const setMobileControls = useGalleryStore((s) => s.setMobileControls);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-stone-100 to-stone-200 z-30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-stone-300 border-t-amber-700 rounded-full animate-spin" />
          <p className="text-stone-600 text-sm tracking-wide">正在加载展厅…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 帮助提示 - 仅显示一次 */}
      {showHelp && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/65 backdrop-blur-md text-white px-5 py-3 rounded-xl text-sm shadow-lg animate-[fadeIn_0.3s_ease-out] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          {isTouch ? (
            <div className="flex items-center gap-3">
              <span>
                <strong>滑动</strong>转动视角 · <strong>点画</strong>查看详情
              </span>
              <button
                className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs"
                onClick={toggleHelp}
              >
                知道了
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span>
                <strong>点击</strong>锁定鼠标 · <strong>WASD</strong>移动 ·
                <strong> 鼠标</strong>视角 · <strong>ESC</strong>退出
              </span>
              <button
                className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs"
                onClick={toggleHelp}
              >
                知道了
              </button>
            </div>
          )}
        </div>
      )}

      {/* 右上角帮助按钮 */}
      {!showHelp && (
        <button
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toggleHelp();
          }}
          aria-label="帮助"
        >
          ?
        </button>
      )}

      {/* 移动端虚拟摇杆 */}
      {isTouch && mobileControls && <VirtualJoystick />}
    </>
  );
}

function VirtualJoystick() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const radius = 50;

  return (
    <div
      className="absolute bottom-6 left-6 z-20 select-none"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setActive(true);
        setOrigin({ x: e.clientX, y: e.clientY });
      }}
      onPointerMove={(e) => {
        if (!active) return;
        let dx = e.clientX - origin.x;
        let dy = e.clientY - origin.y;
        const dist = Math.hypot(dx, dy);
        if (dist > radius) {
          dx = (dx / dist) * radius;
          dy = (dy / dist) * radius;
        }
        setPos({ x: dx, y: dy });

        // 同步到store：通过事件总线传给控制组件
        const nx = dx / radius;
        const ny = -dy / radius;
        window.dispatchEvent(
          new CustomEvent("joystick-move", { detail: { x: nx, y: ny } })
        );
      }}
      onPointerUp={() => {
        setActive(false);
        setPos({ x: 0, y: 0 });
        window.dispatchEvent(
          new CustomEvent("joystick-move", { detail: { x: 0, y: 0 } })
        );
      }}
      onPointerCancel={() => {
        setActive(false);
        setPos({ x: 0, y: 0 });
        window.dispatchEvent(
          new CustomEvent("joystick-move", { detail: { x: 0, y: 0 } })
        );
      }}
    >
      <div
        className="relative rounded-full bg-black/40 backdrop-blur"
        style={{ width: radius * 2, height: radius * 2 }}
      >
        <div
          className="absolute top-1/2 left-1/2 rounded-full bg-white/60"
          style={{
            width: 36,
            height: 36,
            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
            transition: active ? "none" : "transform 0.15s",
          }}
        />
      </div>
    </div>
  );
}
