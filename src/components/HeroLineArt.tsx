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

    const arcPts = (cx: number, cy: number, r: number, s: number, e: number, n: number): {x:number;y:number}[] => {
      const pts: {x:number;y:number}[] = [];
      for (let i = 0; i <= n; i++) {
        const a = s + (e - s) * (i / n);
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      return pts;
    };

    const bezier = (x1:number,y1:number, cx1:number,cy1:number, cx2:number,cy2:number, x2:number,y2:number, n:number): {x:number;y:number}[] => {
      const pts: {x:number;y:number}[] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        pts.push({
          x: u*u*u*x1 + 3*u*u*t*cx1 + 3*u*t*t*cx2 + t*t*t*x2,
          y: u*u*u*y1 + 3*u*u*t*cy1 + 3*u*t*t*cy2 + t*t*t*y2,
        });
      }
      return pts;
    };

    // ============================
    // Stickman with telescope, looking at target people in the distance
    // ============================

    // -- Stickman (left side, big) --
    const sx = 180, sy = 280;
    const head = circle(sx, sy - 85, 32, 50);
    const body = ln(sx, sy - 53, sx, sy + 45, 25);
    const legL = ln(sx, sy + 45, sx - 30, sy + 120, 20);
    const legR = ln(sx, sy + 45, sx + 30, sy + 120, 20);
    // Left arm holds telescope up
    const armL = ln(sx, sy - 28, sx + 55, sy - 75, 18);
    // Right arm supports telescope
    const armR = ln(sx, sy - 20, sx + 45, sy - 65, 15);
    // Eyes (looking right through telescope)
    const eyeL = circle(sx - 8, sy - 92, 4, 14);
    const eyeR = circle(sx + 10, sy - 92, 4, 14);
    // Focused mouth (small line)
    const mouth = ln(sx - 6, sy - 72, sx + 6, sy - 72, 8);

    // -- Telescope --
    // Main tube
    const scopeBody = ln(sx + 50, sy - 72, sx + 120, sy - 105, 25);
    // Front lens (bigger circle)
    const scopeLensFront = circle(sx + 125, sy - 108, 18, 30);
    // Back eyepiece (smaller circle)
    const scopeLensBack = circle(sx + 48, sy - 70, 8, 18);

    // -- Vision cone / spotlight from telescope --
    const coneLine1 = ln(sx + 143, sy - 108, 580, sy - 200, 30);
    const coneLine2 = ln(sx + 143, sy - 108, 580, sy - 60, 30);
    // Dashed arc at the end connecting cone lines
    const coneArc = arcPts(580, sy - 130, 70, -Math.PI * 0.45, Math.PI * 0.45, 25);

    // -- Target people (small stickmen in the spotlight area) --
    const miniMan = (mx: number, my: number, s: number): {x:number;y:number}[][] => {
      const h = circle(mx, my - s * 2.5, s * 0.9, 20);
      const b = ln(mx, my - s * 1.6, mx, my + s * 0.5, 10);
      const ll = ln(mx, my + s * 0.5, mx - s * 0.7, my + s * 2, 8);
      const lr = ln(mx, my + s * 0.5, mx + s * 0.7, my + s * 2, 8);
      const al = ln(mx, my - s * 1.0, mx - s * 1.0, my - s * 0.2, 8);
      const ar = ln(mx, my - s * 1.0, mx + s * 1.0, my - s * 0.2, 8);
      return [h, b, ll, lr, al, ar];
    };

    const person1 = miniMan(480, sy - 155, 14);
    const person2 = miniMan(530, sy - 130, 12);
    const person3 = miniMan(570, sy - 105, 11);
    const person4 = miniMan(510, sy - 85, 13);

    // -- Target crosshair on the most prominent person --
    const targetCircle = circle(480, sy - 155, 28, 35);
    const targetH = ln(480 - 35, sy - 155, 480 + 35, sy - 155, 10);
    const targetV = ln(480, sy - 155 - 35, 480, sy - 155 + 35, 10);

    // -- Ground --
    const ground = bezier(30, sy + 125, 150, sy + 118, 250, sy + 130, 350, sy + 125, 30);

    // (dollars removed)

    // -- Sparkles --
    const sp = (cx: number, cy: number, s: number): {x:number;y:number}[][] => [
      ln(cx - s, cy, cx + s, cy, 6),
      ln(cx, cy - s, cx, cy + s, 6),
    ];
    const spark1 = sp(440, sy - 190, 9);
    const spark2 = sp(600, sy - 50, 8);
    const spark3 = sp(sx + 140, sy - 130, 7);

    // ============================
    const allStrokes: {x:number;y:number}[][] = [
      // Ground
      ground,
      // Stickman
      head, eyeL, eyeR, mouth, body, legL, legR, armL, armR,
      // Telescope
      scopeBody, scopeLensFront, scopeLensBack,
      // Vision cone
      coneLine1, coneLine2, coneArc,
      // Target people
      ...person1, ...person2, ...person3, ...person4,
      // Crosshair on target
      targetCircle, targetH, targetV,
      // Sparkles
      ...spark1, ...spark2, ...spark3,
    ];

    let frame = 0;

    const drawStroke = (pts: {x:number;y:number}[], time: number) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        const wx = Math.sin(time * 1.3 + i * 0.28) * 2.0;
        const wy = Math.cos(time * 0.95 + i * 0.22) * 1.6;
        const x = pt.x + wx;
        const y = pt.y + wy;

        ctx.lineWidth = 5 + Math.sin(time * 1.4 + i * 0.35) * 1.0;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prev = pts[i - 1];
          const pwx = Math.sin(time * 1.3 + (i - 1) * 0.28) * 2.0;
          const pwy = Math.cos(time * 0.95 + (i - 1) * 0.22) * 1.6;
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
