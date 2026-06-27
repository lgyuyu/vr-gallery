"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { Room } from "./Room";
import { PaintingOnWall } from "./PaintingOnWall";
import { FirstPersonControls } from "./FirstPersonControls";
import { distributePaintings, type RoomDimensions } from "@/lib/wall-layout";
import { STYLE_CONFIGS } from "@/lib/styles";
import { useGalleryStore } from "@/store/gallery";
import type { PaintingData, GalleryStyle } from "@/lib/types";

export interface GallerySceneProps {
  paintings: PaintingData[];
  style: GalleryStyle;
  studentName: string;
}

const ROOM: RoomDimensions = { width: 16, height: 3.5, depth: 10 };
const BOUNDS = { minX: -7.2, maxX: 7.2, minZ: -4.2, maxZ: 4.2 };

export function GalleryScene(props: GallerySceneProps) {
  const { paintings, style, studentName } = props;
  const setLoading = useGalleryStore((s) => s.setLoading);
  const styleConfig = STYLE_CONFIGS[style];
  const [error, setError] = useState<Error | null>(null);

  return (
    <ErrorBoundary onError={setError} error={error}>
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ fov: 70, near: 0.05, far: 100, position: [0, 1.65, 4] }}
        onCreated={({ gl, scene }) => {
          console.log("[GalleryScene] Canvas created");
          gl.setClearColor("#3a2814");
          // 暂时不用fog
          // scene.fog = new THREE.Fog("#1a1814", 8, 25);
          setLoading(false);
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneContents
            paintings={paintings}
            styleConfig={styleConfig}
            studentName={studentName}
          />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}

function SceneContents({
  paintings,
  styleConfig,
  studentName,
}: {
  paintings: PaintingData[];
  styleConfig: (typeof STYLE_CONFIGS)[GalleryStyle];
  studentName: string;
}) {
  const selectPainting = useGalleryStore((s) => s.selectPainting);
  const layout = distributePaintings(paintings, ROOM);

  return (
    <>
      <ambientLight
        color={styleConfig.ambientColor}
        intensity={styleConfig.ambientIntensity}
      />
      <hemisphereLight color={"#fff8e8"} groundColor={styleConfig.floorColor} intensity={0.5} />
      <directionalLight position={[0, 5, 2]} intensity={0.4} color="#ffffff" />

      <Room styleConfig={styleConfig} {...ROOM} />

      {layout.map((wp) => (
        <PaintingOnWall
          key={wp.painting.id}
          painting={wp.painting}
          styleConfig={styleConfig}
          position={wp.position}
          rotationY={wp.rotationY}
          onSelect={selectPainting}
        />
      ))}

      <NamePlate text={studentName} frameColor={styleConfig.frameColor} />

      {styleConfig.hasFurniture && <CozyDecor />}

      <FirstPersonControls bounds={BOUNDS} />
    </>
  );
}

function LoadingFallback() {
  useEffect(() => {
    console.log("[GalleryScene] Suspense loading...");
    return () => console.log("[GalleryScene] Suspense resolved");
  }, []);
  return null;
}

function NamePlate({ text, frameColor }: { text: string; frameColor: string }) {
  const texture = (() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${text} · 画展`, 256, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();

  return (
    <mesh position={[0, 3.0, -ROOM.depth / 2 + 0.06]}>
      <planeGeometry args={[2.2, 0.55]} />
      <meshStandardMaterial map={texture ?? undefined} roughness={0.5} />
    </mesh>
  );
}

function CozyDecor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial color="#9a7a52" roughness={0.95} />
    </mesh>
  );
}

// ===== Error Boundary =====
import { Component, type ReactNode } from "react";

interface EBProps {
  children: ReactNode;
  onError: (e: Error) => void;
  error: Error | null;
}

class ErrorBoundary extends Component<EBProps, { hasError: boolean }> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    console.error("[GalleryScene] Render error:", error);
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    if (this.state.hasError || this.props.error) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900 text-white">
          <div className="text-center max-w-md p-6">
            <p className="text-red-400 text-sm mb-2">3D 场景加载失败</p>
            <p className="text-stone-400 text-xs font-mono break-all">
              {String((this.props.error as Error)?.message ?? "unknown error")}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
