import type { GalleryStyle } from "@/lib/types";

export interface StyleConfig {
  // 墙壁
  wallColor: string;
  wallRoughness: number;
  wallMetalness: number;
  // 地板
  floorColor: string;
  floorRoughness: number;
  // 天花板
  ceilingColor: string;
  // 环境光
  ambientColor: string;
  ambientIntensity: number;
  // 聚光灯
  spotlightColor: string;
  spotlightIntensity: number;
  // 画框
  frameColor: string;
  frameRoughness: number;
  frameMetalness: number;
  frameWidth: number; // 边框厚度（相对画宽比例）
  // 装饰
  hasFurniture: boolean;
  // 文字描述
  label: string;
  description: string;
}

export const STYLE_CONFIGS: Record<GalleryStyle, StyleConfig> = {
  modern: {
    wallColor: "#e8e6e1",
    wallRoughness: 0.92,
    wallMetalness: 0.0,
    floorColor: "#9b8158",
    floorRoughness: 0.65,
    ceilingColor: "#f2f0eb",
    ambientColor: "#fffaf0",
    ambientIntensity: 0.45,
    spotlightColor: "#ffffff",
    spotlightIntensity: 1.6,
    frameColor: "#1a1a1a",
    frameRoughness: 0.35,
    frameMetalness: 0.2,
    frameWidth: 0.035,
    hasFurniture: false,
    label: "现代简约",
    description: "白墙·木地板·射灯",
  },
  cozy: {
    wallColor: "#e8d5b7",
    wallRoughness: 0.95,
    wallMetalness: 0.0,
    floorColor: "#6b4423",
    floorRoughness: 0.85,
    ceilingColor: "#efe2cc",
    ambientColor: "#ffe8c8",
    ambientIntensity: 0.55,
    spotlightColor: "#ffe9c8",
    spotlightIntensity: 1.4,
    frameColor: "#5a3a1f",
    frameRoughness: 0.7,
    frameMetalness: 0.05,
    frameWidth: 0.06,
    hasFurniture: true,
    label: "温馨家居",
    description: "暖墙·木地板·柔光",
  },
};
