"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import type { PaintingData } from "@/lib/types";
import type { StyleConfig } from "@/lib/styles";

interface PaintingOnWallProps {
  painting: PaintingData;
  styleConfig: StyleConfig;
  position: [number, number, number]; // 画作中心位置
  rotationY: number; // 朝向（绕Y轴）
  maxPaintingWidth?: number;
  maxPaintingHeight?: number;
  onSelect: (p: PaintingData) => void;
}

/**
 * 挂在墙上的画作：画框 + 画布 + 聚光灯
 */
export function PaintingOnWall({
  painting,
  styleConfig,
  position,
  rotationY,
  maxPaintingWidth = 1.8,
  maxPaintingHeight = 2.4,
  onSelect,
}: PaintingOnWallProps) {
  const [hovered, setHovered] = useState(false);
  const [imageAspect, setImageAspect] = useState(0.8); // 默认 4:5
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const frameWidth = styleConfig.frameWidth * maxPaintingWidth;
  const frameDepth = 0.04;

  // 加载图片，计算实际宽高比
  useEffect(() => {
    if (!painting.imageUrl) return;
    const isDataUrl = painting.imageUrl.startsWith("data:");
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      painting.imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        setTex(texture);
        const img = texture.image;
        if (img && img.width && img.height) {
          setImageAspect(img.width / img.height);
        }
      },
      undefined,
      (err) => {
        // 静默失败 - 加载占位
        console.warn("画作加载失败", painting.id, err);
      }
    );
  }, [painting.id, painting.imageUrl]);

  // 根据图片宽高比，计算画布实际尺寸
  const { canvasW, canvasH } = useMemo(() => {
    let w = maxPaintingHeight * imageAspect;
    let h = maxPaintingHeight;
    if (w > maxPaintingWidth) {
      w = maxPaintingWidth;
      h = w / imageAspect;
    }
    return { canvasW: w, canvasH: h };
  }, [imageAspect, maxPaintingWidth, maxPaintingHeight]);

  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: styleConfig.frameColor,
        roughness: styleConfig.frameRoughness,
        metalness: styleConfig.frameMetalness,
      }),
    [styleConfig]
  );

  // 画框：4个长方体边
  const FrameBar = ({
    pos,
    size,
  }: {
    pos: [number, number, number];
    size: [number, number, number];
  }) => (
    <mesh position={pos} material={frameMat}>
      <boxGeometry args={size} />
    </mesh>
  );

  const totalW = canvasW + frameWidth * 2;
  const totalH = canvasH + frameWidth * 2;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 画框 */}
      <FrameBar
        pos={[0, canvasH / 2 + frameWidth / 2, 0]}
        size={[totalW, frameWidth, frameDepth]}
      />
      <FrameBar
        pos={[0, -canvasH / 2 - frameWidth / 2, 0]}
        size={[totalW, frameWidth, frameDepth]}
      />
      <FrameBar
        pos={[-canvasW / 2 - frameWidth / 2, 0, 0]}
        size={[frameWidth, canvasH, frameDepth]}
      />
      <FrameBar
        pos={[canvasW / 2 + frameWidth / 2, 0, 0]}
        size={[frameWidth, canvasH, frameDepth]}
      />

      {/* 画框背板（防止透到墙） */}
      <mesh position={[0, 0, -frameDepth / 2 + 0.005]}>
        <planeGeometry args={[totalW, totalH]} />
        <meshStandardMaterial color={styleConfig.frameColor} roughness={0.7} />
      </mesh>

      {/* 画布（点击交互） */}
      <mesh
        position={[0, 0, 0.005]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(painting);
        }}
      >
        <planeGeometry args={[canvasW, canvasH]} />
        <meshStandardMaterial
          map={tex ?? undefined}
          color={tex ? "#ffffff" : "#d8d2c8"}
          roughness={0.85}
          metalness={0.0}
          emissive={hovered ? "#ffffff" : "#000000"}
          emissiveIntensity={hovered ? 0.06 : 0}
        />
      </mesh>

      {/* 聚光灯：从画作上方照射 */}
      <spotLight
        position={[0, 0.9, 0.4]}
        target-position={[0, 0, 0]}
        angle={0.5}
        penumbra={0.6}
        intensity={styleConfig.spotlightIntensity * (hovered ? 1.2 : 1)}
        distance={3.5}
        color={styleConfig.spotlightColor}
        castShadow={false}
      />
    </group>
  );
}
