"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { StyleConfig } from "@/lib/styles";

interface RoomProps {
  styleConfig: StyleConfig;
  // 房间尺寸（米）
  width?: number;
  height?: number;
  depth?: number;
}

/**
 * 展厅房间：4面墙 + 地板 + 天花板
 * 默认 16m宽 × 10m深 × 3.5m高
 */
export function Room({
  styleConfig,
  width = 16,
  height = 3.5,
  depth = 10,
}: RoomProps) {
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: styleConfig.wallColor,
        roughness: styleConfig.wallRoughness,
        metalness: styleConfig.wallMetalness,
      }),
    [styleConfig]
  );

  const floorMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: styleConfig.floorColor,
      roughness: styleConfig.floorRoughness,
      metalness: 0.0,
    });
    return m;
  }, [styleConfig]);

  const ceilingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: styleConfig.ceilingColor,
        roughness: 0.95,
      }),
    [styleConfig]
  );

  return (
    <group>
      {/* 地板 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={floorMat}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* 天花板 */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, 0]}
        material={ceilingMat}
      >
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* 后墙（z = -depth/2） */}
      <mesh
        position={[0, height / 2, -depth / 2]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* 前墙（z = +depth/2） */}
      <mesh
        position={[0, height / 2, depth / 2]}
        rotation={[0, Math.PI, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* 左墙（x = -width/2） */}
      <mesh
        position={[-width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[depth, height]} />
      </mesh>

      {/* 右墙（x = +width/2） */}
      <mesh
        position={[width / 2, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[depth, height]} />
      </mesh>

      {/* 踢脚线（增加质感） */}
      <Baseboard width={width} depth={depth} />
    </group>
  );
}

function Baseboard({ width, depth }: { width: number; depth: number }) {
  const h = 0.08;
  const t = 0.02;
  return (
    <group>
      {/* 后墙底部 */}
      <mesh position={[0, h / 2, -depth / 2 + t / 2]}>
        <boxGeometry args={[width, h, t]} />
        <meshStandardMaterial color="#c8c2b5" roughness={0.6} />
      </mesh>
      {/* 前墙底部 */}
      <mesh position={[0, h / 2, depth / 2 - t / 2]}>
        <boxGeometry args={[width, h, t]} />
        <meshStandardMaterial color="#c8c2b5" roughness={0.6} />
      </mesh>
      {/* 左墙底部 */}
      <mesh position={[-width / 2 + t / 2, h / 2, 0]}>
        <boxGeometry args={[t, h, depth]} />
        <meshStandardMaterial color="#c8c2b5" roughness={0.6} />
      </mesh>
      {/* 右墙底部 */}
      <mesh position={[width / 2 - t / 2, h / 2, 0]}>
        <boxGeometry args={[t, h, depth]} />
        <meshStandardMaterial color="#c8c2b5" roughness={0.6} />
      </mesh>
    </group>
  );
}
