"use client";

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FirstPersonControlsProps {
  enabled?: boolean;
  initialPosition?: [number, number, number];
  initialLookAt?: [number, number, number];
  // 房间边界（用于碰撞检测）
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  moveSpeed?: number;
  lookSpeed?: number;
  eyeHeight?: number;
  // 移动端虚拟摇杆状态（外部传入）
  mobileMove?: { x: number; y: number }; // -1..1
}

/**
 * 第一人称漫游控制：
 * - PC：鼠标移动旋转视角（点击锁定后），WASD移动
 * - 手机：单指拖动旋转视角，可选虚拟摇杆移动
 * 自动检测设备
 */
export function FirstPersonControls({
  enabled = true,
  initialPosition = [0, 1.65, 4],
  initialLookAt = [0, 1.65, 0],
  bounds = { minX: -7.5, maxX: 7.5, minZ: -4.5, maxZ: 4.5 },
  moveSpeed = 3.0,
  lookSpeed = 0.0025,
  eyeHeight = 1.65,
  mobileMove,
}: FirstPersonControlsProps) {
  const { camera, gl } = useThree();
  const isLocked = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const isTouch = useRef(false);

  // 触摸状态
  const touchState = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  // 视角通过欧拉角控制
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const moveVec = useRef(new THREE.Vector3());
  // 移动端摇杆输入（通过事件传入）
  const joystick = useRef({ x: 0, y: 0 });

  // 设置初始位置和朝向
  useEffect(() => {
    camera.position.set(...initialPosition);
    camera.lookAt(new THREE.Vector3(...initialLookAt));
    // 同步euler
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]); // eslint-disable-line react-hooks/exhaustive-deps

  // 检测触摸设备
  useEffect(() => {
    isTouch.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  // 监听虚拟摇杆事件
  useEffect(() => {
    const onJoystick = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      joystick.current = { x: detail.x, y: detail.y };
    };
    window.addEventListener("joystick-move", onJoystick as EventListener);
    return () => window.removeEventListener("joystick-move", onJoystick as EventListener);
  }, []);

  // ===== PC：Pointer Lock =====
  useEffect(() => {
    if (!enabled || isTouch.current) return;
    const canvas = gl.domElement;

    const onClick = () => {
      if (!isLocked.current) {
        canvas.requestPointerLock?.();
      }
    };

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      euler.current.y -= e.movementX * lookSpeed;
      euler.current.x -= e.movementY * lookSpeed;
      // 限制俯仰
      euler.current.x = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, euler.current.x)
      );
      camera.quaternion.setFromEuler(euler.current);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      // ESC 释放鼠标由浏览器处理
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    canvas.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [enabled, gl, camera, lookSpeed]);

  // ===== 触摸：拖动旋转 =====
  useEffect(() => {
    if (!enabled || !isTouch.current) return;
    const canvas = gl.domElement;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchState.current.active = true;
        touchState.current.lastX = e.touches[0].clientX;
        touchState.current.lastY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchState.current.active || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - touchState.current.lastX;
      const dy = e.touches[0].clientY - touchState.current.lastY;
      touchState.current.lastX = e.touches[0].clientX;
      touchState.current.lastY = e.touches[0].clientY;
      // 触摸灵敏度
      euler.current.y -= dx * lookSpeed * 1.8;
      euler.current.x -= dy * lookSpeed * 1.8;
      euler.current.x = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, euler.current.x)
      );
      camera.quaternion.setFromEuler(euler.current);
    };
    const onTouchEnd = () => {
      touchState.current.active = false;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, gl, camera, lookSpeed]);

  // ===== 每帧：移动 =====
  useFrame((_, dt) => {
    if (!enabled) return;
    const speed = moveSpeed * Math.min(dt, 0.1);
    moveVec.current.set(0, 0, 0);

    // PC键盘
    if (!isTouch.current) {
      if (keys.current["KeyW"] || keys.current["ArrowUp"]) moveVec.current.z -= 1;
      if (keys.current["KeyS"] || keys.current["ArrowDown"]) moveVec.current.z += 1;
      if (keys.current["KeyA"] || keys.current["ArrowLeft"]) moveVec.current.x -= 1;
      if (keys.current["KeyD"] || keys.current["ArrowRight"]) moveVec.current.x += 1;
    }

    // 移动端虚拟摇杆
    if (isTouch.current) {
      moveVec.current.x += joystick.current.x;
      moveVec.current.z -= joystick.current.y;
    }

    if (moveVec.current.lengthSq() > 0) {
      moveVec.current.normalize().multiplyScalar(speed);
      // 相对相机朝向移动
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      const delta = new THREE.Vector3();
      delta.addScaledVector(forward, -moveVec.current.z);
      delta.addScaledVector(right, moveVec.current.x);

      const newX = camera.position.x + delta.x;
      const newZ = camera.position.z + delta.z;
      // 边界约束
      camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, newZ));
      camera.position.y = eyeHeight;
    }
  });

  return null;
}
