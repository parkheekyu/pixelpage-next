"use client";

import { useEffect, useRef } from "react";

/**
 * Branded Content Hero Line Art
 * 카메라를 들고 영상을 찍는 졸라맨 + 유튜브 플레이 버튼 + 구독자 증가 그래프
 * 손그림 스타일, 꿈틀꿈틀 애니메이션 (퍼포먼스 페이지와 동일한 톤)
 */
const BrandedHeroArt = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W = 700;
    const H = 600;
    const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;

    const canvas = document.createElement("canvas");
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    // ----- helpers -----
    const circle = (cx: number, cy: number, r: number, n: number): {x:number;y:number}[] => {
      const pts: {x:number;y:number}[] = [];
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      return pts;
    };
    const ln = (x1: number, y1: number, x2: number, y2: number, n: number): {x:number;y:number}[] => {
      const pts: {x:number;y:number}[] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
      }
      return pts;
    };
    const rectPath = (x: number, y: number, w: number, h: number, n: number): {x:number;y:number}[] => {
      const pts: {x:number;y:number}[] = [];
      const per = 2 * (w + h);
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * per;
        if (t <= w) pts.push({ x: x + t, y });
        else if (t <= w + h) pts.push({ x: x + w, y: y + (t - w) });
        else if (t <= 2 * w + h) pts.push({ x: x + w - (t - w - h), y: y + h });
        else pts.push({ x, y: y + h - (t - 2 * w - h) });
      }
      return pts;
    };
    const arcPts = (cx: number, cy: number, r: number, s: number, e: number, n: number): {x:number;y:number}[] => {
      const pts: {x:number;y:number}[] = [];
      for (let i = 0; i <= n; i++) {
        const a = s + (e - s) * (i / n);
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      return pts;
    };

    // ============================
    // Scene: stickman cameraman on the left, big YouTube play screen floating,
    // subscriber growth chart on the right, sparkle/motion marks
    // ============================

    // --- Stickman (left, holding camera) ---
    const sx = 175, sy = 340;
    const head = circle(sx, sy - 75, 26, 42);
    const body = ln(sx, sy - 50, sx, sy + 35, 22);
    const legL = ln(sx, sy + 35, sx - 28, sy + 100, 18);
    const legR = ln(sx, sy + 35, sx + 28, sy + 100, 18);
    // Arms raised up holding a camera in front of face
    const armL = ln(sx, sy - 28, sx + 50, sy - 65, 15);
    const armR = ln(sx + 30, sy - 20, sx + 75, sy - 55, 15);
    // Eyes (peeking from behind the camera viewfinder — one eye)
    const eye = circle(sx - 8, sy - 80, 3, 12);
    const smile = arcPts(sx - 3, sy - 68, 7, 0.2, Math.PI - 0.2, 12);

    // --- Camera ---
    const camBody = rectPath(sx + 55, sy - 85, 95, 55, 80);
    const camLens = circle(sx + 85, sy - 57, 20, 35);
    const camLensInner = circle(sx + 85, sy - 57, 12, 28);
    // Record dot / flash
    const camRecord = circle(sx + 140, sy - 75, 4, 12);
    // Top handle
    const camHandle = rectPath(sx + 85, sy - 95, 30, 10, 30);
    // Tripod stand (bottom of camera goes down)
    const tripodMid = ln(sx + 100, sy - 30, sx + 100, sy + 60, 15);
    const tripodL = ln(sx + 100, sy + 60, sx + 75, sy + 105, 10);
    const tripodR = ln(sx + 100, sy + 60, sx + 125, sy + 105, 10);
    const tripodMidLeg = ln(sx + 100, sy + 60, sx + 105, sy + 105, 10);

    // --- YouTube Play screen (floating right of stickman) ---
    const screenX = 360, screenY = 180, screenW = 260, screenH = 150;
    const screen = rectPath(screenX, screenY, screenW, screenH, 120);
    // Play button triangle
    const playCx = screenX + screenW / 2;
    const playCy = screenY + screenH / 2;
    const playCircle = circle(playCx, playCy, 32, 36);
    // Triangle as line path
    const tri: {x:number;y:number}[] = [
      { x: playCx - 10, y: playCy - 14 },
      { x: playCx + 15, y: playCy },
      { x: playCx - 10, y: playCy + 14 },
      { x: playCx - 10, y: playCy - 14 },
    ];
    // Progress bar at bottom of screen
    const progressBar = ln(screenX + 15, screenY + screenH - 15, screenX + screenW - 70, screenY + screenH - 15, 15);
    const progressDot = circle(screenX + screenW - 70, screenY + screenH - 15, 5, 12);
    const progressRemain = ln(screenX + screenW - 70, screenY + screenH - 15, screenX + screenW - 15, screenY + screenH - 15, 10);

    // --- Subscriber growth chart (bottom right) ---
    const chartBaseX = 380, chartBaseY = 460;
    const chartAxisX = ln(chartBaseX, chartBaseY, chartBaseX + 230, chartBaseY, 20);
    const chartAxisY = ln(chartBaseX, chartBaseY, chartBaseX, chartBaseY - 100, 12);
    // Growth curve rising
    const growthCurve: {x:number;y:number}[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      growthCurve.push({
        x: chartBaseX + t * 220,
        y: chartBaseY - t * t * 85 - Math.sin(t * Math.PI * 2) * 3,
      });
    }
    // Arrow tip at end
    const arrowEnd = { x: chartBaseX + 220, y: chartBaseY - 85 };
    const arrowA = ln(arrowEnd.x, arrowEnd.y, arrowEnd.x - 12, arrowEnd.y + 2, 6);
    const arrowB = ln(arrowEnd.x, arrowEnd.y, arrowEnd.x - 8, arrowEnd.y - 10, 6);

    // --- Sparkles / motion marks ---
    const sp = (cx: number, cy: number, s: number): {x:number;y:number}[][] => [
      ln(cx - s, cy, cx + s, cy, 6),
      ln(cx, cy - s, cx, cy + s, 6),
    ];
    const sparkA = sp(310, 140, 10);
    const sparkB = sp(640, 230, 8);
    const sparkC = sp(280, 470, 9);

    // ============================
    const allStrokes: {x:number;y:number}[][] = [
      // Stickman
      head, body, legL, legR, armL, armR, eye, smile,
      // Tripod first (behind)
      tripodMid, tripodL, tripodR, tripodMidLeg,
      // Camera
      camBody, camLens, camLensInner, camRecord, camHandle,
      // Screen with play
      screen, playCircle, tri, progressBar, progressDot, progressRemain,
      // Chart
      chartAxisX, chartAxisY, growthCurve, arrowA, arrowB,
      // Sparkles
      ...sparkA, ...sparkB, ...sparkC,
    ];

    let frame = 0;

    const drawStroke = (pts: {x:number;y:number}[], time: number) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        const wx = Math.sin(time * 1.3 + i * 0.28) * 1.8;
        const wy = Math.cos(time * 0.95 + i * 0.22) * 1.4;
        const x = pt.x + wx;
        const y = pt.y + wy;
        ctx.lineWidth = 5 + Math.sin(time * 1.4 + i * 0.35) * 0.9;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prev = pts[i - 1];
          const pwx = Math.sin(time * 1.3 + (i - 1) * 0.28) * 1.8;
          const pwy = Math.cos(time * 0.95 + (i - 1) * 0.22) * 1.4;
          const midX = (prev.x + pwx + x) / 2;
          const midY = (prev.y + pwy + y) / 2;
          ctx.quadraticCurveTo(prev.x + pwx, prev.y + pwy, midX, midY);
        }
      }
      ctx.stroke();
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      const time = frame * 0.015;

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const stroke of allStrokes) {
        drawStroke(stroke, time);
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (canvasRef.current && container) {
        container.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full max-w-[560px] max-h-[480px]"
      style={{ aspectRatio: "700 / 600" }}
    />
  );
};

export default BrandedHeroArt;
