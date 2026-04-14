"use client";

import { useEffect, useRef } from "react";

const HeroLineArt = () => {
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

    // --- Helpers ---
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

    const rect = (x: number, y: number, w: number, h: number, n: number): {x:number;y:number}[] => {
      const pts: {x:number;y:number}[] = [];
      const perimeter = 2 * (w + h);
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * perimeter;
        if (t <= w) {
          pts.push({ x: x + t, y });
        } else if (t <= w + h) {
          pts.push({ x: x + w, y: y + (t - w) });
        } else if (t <= 2 * w + h) {
          pts.push({ x: x + w - (t - w - h), y: y + h });
        } else {
          pts.push({ x, y: y + h - (t - 2 * w - h) });
        }
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
    // Scene: Bills (money) flying away / being wasted
    // A hand dropping bills, bills scattered and floating away
    // ============================

    // -- Bill shape: rounded rectangle + "$" or "W" inside --
    const makeBill = (bx: number, by: number, bw: number, bh: number, angle: number): {x:number;y:number}[][] => {
      // Rotated rectangle points
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotate = (px: number, py: number) => ({
        x: bx + (px - bx) * cos - (py - by) * sin,
        y: by + (px - bx) * sin + (py - by) * cos,
      });

      const hw = bw / 2, hh = bh / 2;
      const corners = [
        { x: bx - hw, y: by - hh },
        { x: bx + hw, y: by - hh },
        { x: bx + hw, y: by + hh },
        { x: bx - hw, y: by + hh },
        { x: bx - hw, y: by - hh },
      ];
      const outline: {x:number;y:number}[] = [];
      for (let i = 0; i < corners.length - 1; i++) {
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          const px = corners[i].x + (corners[i + 1].x - corners[i].x) * t;
          const py = corners[i].y + (corners[i + 1].y - corners[i].y) * t;
          outline.push(rotate(px, py));
        }
      }

      // Inner circle
      const innerCircle: {x:number;y:number}[] = [];
      const cr = Math.min(bw, bh) * 0.28;
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const px = bx + Math.cos(a) * cr;
        const py = by + Math.sin(a) * cr;
        innerCircle.push(rotate(px, py));
      }

      // "W" (won sign) inside
      const ws = cr * 0.6;
      const wPts: {x:number;y:number}[] = [];
      const wRaw = [
        { x: bx - ws, y: by - ws * 0.6 },
        { x: bx - ws * 0.5, y: by + ws * 0.6 },
        { x: bx, y: by - ws * 0.2 },
        { x: bx + ws * 0.5, y: by + ws * 0.6 },
        { x: bx + ws, y: by - ws * 0.6 },
      ];
      for (let i = 0; i < wRaw.length - 1; i++) {
        for (let j = 0; j <= 6; j++) {
          const t = j / 6;
          const px = wRaw[i].x + (wRaw[i + 1].x - wRaw[i].x) * t;
          const py = wRaw[i].y + (wRaw[i + 1].y - wRaw[i].y) * t;
          wPts.push(rotate(px, py));
        }
      }

      return [outline, innerCircle, wPts];
    };

    // Bills scattered — different sizes, angles, positions
    // Big bill center-left (main focus, being dropped)
    const bill1 = makeBill(250, 200, 140, 75, -0.15);
    // Bills flying away to the right and up
    const bill2 = makeBill(420, 130, 120, 65, 0.3);
    const bill3 = makeBill(480, 270, 110, 60, -0.4);
    const bill4 = makeBill(350, 350, 100, 55, 0.6);
    // Small bills far away (more wasted)
    const bill5 = makeBill(560, 180, 85, 45, -0.7);
    const bill6 = makeBill(550, 370, 80, 42, 0.5);

    // -- Motion lines (speed / flying away) --
    const motion1 = ln(320, 180, 390, 145, 15);
    const motion2 = ln(340, 220, 410, 200, 12);
    const motion3 = ln(300, 300, 370, 320, 12);
    const motion4 = ln(470, 160, 530, 130, 10);
    const motion5 = ln(500, 310, 545, 340, 10);

    // -- Hand dropping (bottom-left) --
    // Simple open hand shape releasing bills
    const handWrist = ln(80, 450, 150, 380, 20);
    const handPalm = arcPts(180, 350, 40, Math.PI * 0.7, Math.PI * 1.8, 25);
    // Fingers spread open
    const finger1 = ln(170, 315, 145, 265, 15);
    const finger2 = ln(185, 310, 175, 255, 15);
    const finger3 = ln(200, 312, 205, 255, 15);
    const finger4 = ln(212, 320, 230, 270, 15);
    const thumb = ln(155, 365, 115, 340, 12);

    // -- "Poof" marks where bills vanish --
    const sp = (cx: number, cy: number, s: number): {x:number;y:number}[][] => [
      ln(cx - s, cy, cx + s, cy, 6),
      ln(cx, cy - s, cx, cy + s, 6),
    ];
    const poof1 = sp(600, 150, 12);
    const poof2 = sp(590, 400, 10);
    const poof3 = sp(430, 80, 9);

    // ============================
    const allStrokes: {x:number;y:number}[][] = [
      // Hand
      handWrist, handPalm, finger1, finger2, finger3, finger4, thumb,
      // Main bill
      ...bill1,
      // Flying bills
      ...bill2, ...bill3, ...bill4, ...bill5, ...bill6,
      // Motion lines
      motion1, motion2, motion3, motion4, motion5,
      // Poof marks
      ...poof1, ...poof2, ...poof3,
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

        ctx.lineWidth = 5 + Math.sin(time * 1.4 + i * 0.35) * 0.8;

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

export default HeroLineArt;
