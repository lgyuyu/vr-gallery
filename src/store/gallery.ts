import { create } from "zustand";
import type { PaintingData } from "@/lib/types";

interface GalleryUIState {
  // 当前展开的画作（用于详情浮层）
  selectedPainting: PaintingData | null;
  selectPainting: (p: PaintingData | null) => void;

  // 是否正在加载3D场景
  loading: boolean;
  setLoading: (v: boolean) => void;

  // 是否显示帮助提示
  showHelp: boolean;
  toggleHelp: () => void;

  // 移动端控制：是否开启虚拟摇杆
  mobileControls: boolean;
  setMobileControls: (v: boolean) => void;
}

export const useGalleryStore = create<GalleryUIState>((set) => ({
  selectedPainting: null,
  selectPainting: (p) => set({ selectedPainting: p }),

  loading: true,
  setLoading: (v) => set({ loading: v }),

  showHelp: true,
  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),

  mobileControls: false,
  setMobileControls: (v) => set({ mobileControls: v }),
}));
