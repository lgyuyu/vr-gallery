import type { PaintingData } from "@/lib/types";

export interface WallPainting {
  painting: PaintingData;
  position: [number, number, number];
  rotationY: number;
}

export interface RoomDimensions {
  width: number;  // x方向
  height: number; // y方向
  depth: number;  // z方向
}

/**
 * 把画作分配到四面墙上，自动居中、间距合理
 * 默认画作中心高度：1.6m（适合成年人视线）
 * 后墙/前墙(z=±depth/2): 沿x排列
 * 左墙/右墙(x=±width/2): 沿z排列
 */
export function distributePaintings(
  paintings: PaintingData[],
  room: RoomDimensions,
  eyeHeight = 1.65
): WallPainting[] {
  const n = paintings.length;
  if (n === 0) return [];

  // 默认策略：前墙(进入方向)不放画，画作分布到后墙、左墙、右墙
  // 优先把较多的画放在后墙（视觉焦点）
  // 分配：后墙 40%、左墙 30%、右墙 30%
  const wallY = eyeHeight;
  const halfDepth = room.depth / 2;
  const halfWidth = room.width / 2;

  // 画作占用的最大宽度（让画作之间有足够间距）
  const wallPad = 1.5; // 距离墙边缘最小距离
  const slotPad = 0.6; // 画作之间最小间距

  const results: WallPainting[] = [];

  // ===== 分配策略：每面墙可容纳画作数 =====
  // 4面墙均分，前墙少放点（给入口留空）
  const wallConfig: {
    side: "back" | "left" | "right" | "front";
    count: number;
  }[] = [];

  if (n <= 4) {
    // 少量画作：后墙为主
    wallConfig.push({ side: "back", count: n });
  } else if (n <= 6) {
    wallConfig.push({ side: "back", count: Math.ceil(n / 2) });
    wallConfig.push({ side: "left", count: Math.floor(n / 4) });
    wallConfig.push({ side: "right", count: n - wallConfig[0].count - wallConfig[1].count });
  } else {
    // 7+ 幅：四面墙分布
    const backCount = Math.ceil(n * 0.35);
    const leftCount = Math.ceil((n - backCount) * 0.5);
    const rightCount = n - backCount - leftCount;
    wallConfig.push({ side: "back", count: backCount });
    wallConfig.push({ side: "left", count: leftCount });
    wallConfig.push({ side: "right", count: rightCount });
  }

  let idx = 0;
  for (const { side, count } of wallConfig) {
    if (count <= 0 || idx >= n) continue;

    for (let i = 0; i < count && idx < n; i++) {
      // 当前墙上的相对位置 t: 0..1
      const t = count === 1 ? 0.5 : i / (count - 1);

      // 画作在墙长度方向上的中心位置
      // 用居中分布：以墙中心为0，向两侧扩展
      let pos: [number, number, number];
      let rotY: number;

      if (side === "back") {
        // z = -depth/2, 朝向 +z（rotationY = 0）
        // 沿x分布：从 -halfWidth+wallPad 到 +halfWidth-wallPad
        const x = (t - 0.5) * 2 * (halfWidth - wallPad);
        pos = [x, wallY, -halfDepth + 0.05];
        rotY = 0;
      } else if (side === "front") {
        // z = +depth/2, 朝向 -z（rotationY = π）
        const x = (0.5 - t) * 2 * (halfWidth - wallPad);
        pos = [x, wallY, halfDepth - 0.05];
        rotY = Math.PI;
      } else if (side === "left") {
        // x = -width/2, 朝向 +x（rotationY = π/2）
        const z = (t - 0.5) * 2 * (halfDepth - wallPad);
        pos = [-halfWidth + 0.05, wallY, z];
        rotY = Math.PI / 2;
      } else {
        // right: x = +width/2, 朝向 -x（rotationY = -π/2）
        const z = (0.5 - t) * 2 * (halfDepth - wallPad);
        pos = [halfWidth - 0.05, wallY, z];
        rotY = -Math.PI / 2;
      }

      results.push({
        painting: paintings[idx],
        position: pos,
        rotationY: rotY,
      });
      idx++;
    }
  }

  return results;
}
