"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { getFrequencyRead, getStereoRead } from "@/lib/audioReactive";
import { STEREO_FFT } from "./useABAudio";

// A Monstercat-style spectrum that radiates OUTWARD from the player and is only
// visible while a track plays. Crisp cyan bars shoot out from all four edges
// into the (dimmed) page; their height is the live frequency spectrum and the
// smoothed stereo WIDTH scales how far they reach, so a wide master visibly
// throws the bars further. It reads the shared tap, so it lights up for whichever
// player is playing. Sits behind the player content and outside its box, so it
// never covers the controls. Fades out and stops its loop on pause.

const BARS = 150; // total around the perimeter
const BINS = STEREO_FFT / 2;
const USABLE = Math.floor(BINS * 0.55);
// Gap between the player edge and the canvas edge: the bars' room to reach out.
const MARGIN = 150;

function reduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function setEnergy(v: number) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--audio-energy", v.toFixed(3));
  }
}

export function RadialSpectrum({ playing }: { playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!playing) {
      setEnergy(0);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.ceil(rect.width * dpr));
      H = Math.max(1, Math.ceil(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const lFreq = new Uint8Array(BINS);
    const rFreq = new Uint8Array(BINS);
    const lTime = new Float32Array(STEREO_FFT);
    const rTime = new Float32Array(STEREO_FFT);
    const amp = new Float32Array(BARS);
    let widthSm = 0;
    let raf = 0;

    const bandLevel = (data: Uint8Array, frac: number): number => {
      // Sweep lows-to-highs and back around the ring so neighbours relate.
      const sweep = 1 - Math.abs(2 * frac - 1);
      const lo = Math.floor(sweep ** 1.3 * USABLE);
      const hi = Math.min(USABLE, lo + Math.max(1, Math.floor(USABLE / BARS) * 2 + 1));
      let sum = 0;
      for (let b = lo; b < hi; b += 1) sum += data[b];
      return Math.min(1, (sum / (hi - lo) / 255) * 1.8);
    };

    const draw = () => {
      if (document.hidden) {
        raf = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, W, H);

      const m = MARGIN * dpr;
      const ix0 = m;
      const iy0 = m;
      const ix1 = W - m;
      const iy1 = H - m;
      const iw = ix1 - ix0;
      const ih = iy1 - iy0;

      const fr = getFrequencyRead();
      const sr = getStereoRead();
      const gotF = fr ? fr(lFreq, rFreq) : false;
      const gotS = sr ? sr(lTime, rTime) : false;

      if (gotS) {
        let midSum = 0;
        let sideSum = 0;
        for (let k = 0; k < lTime.length; k += 2) {
          const mid = (lTime[k] + rTime[k]) * 0.5;
          const sd = (lTime[k] - rTime[k]) * 0.5;
          midSum += mid * mid;
          sideSum += sd * sd;
        }
        const n = lTime.length / 2;
        const width = Math.min(1.4, Math.sqrt(sideSum / n) / (Math.sqrt(midSum / n) + 1e-4));
        widthSm = widthSm * 0.9 + width * 0.1;
      }

      const reach = (0.45 + widthSm * 0.9) * (MARGIN - 14) * dpr;
      const perim = 2 * (iw + ih);
      const edges = [
        { ax: ix0, ay: iy0, bx: ix1, by: iy0, nx: 0, ny: -1 }, // top, out = up
        { ax: ix1, ay: iy0, bx: ix1, by: iy1, nx: 1, ny: 0 }, // right
        { ax: ix1, ay: iy1, bx: ix0, by: iy1, nx: 0, ny: 1 }, // bottom
        { ax: ix0, ay: iy1, bx: ix0, by: iy0, nx: -1, ny: 0 }, // left
      ];

      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(0, 229, 255, 0.85)";
      ctx.shadowBlur = 6 * dpr;
      let seg = 0;
      let energy = 0;
      for (const e of edges) {
        const elen = Math.hypot(e.bx - e.ax, e.by - e.ay);
        const count = Math.max(3, Math.round((BARS * elen) / perim));
        const thickness = Math.max(2 * dpr, (elen / count) * 0.5);
        for (let k = 0; k < count; k += 1) {
          const t = (k + 0.5) / count;
          const px = e.ax + (e.bx - e.ax) * t;
          const py = e.ay + (e.by - e.ay) * t;
          const frac = seg / BARS;
          const data = px < (ix0 + ix1) / 2 ? lFreq : rFreq;
          const target = gotF ? bandLevel(data, frac) : 0;
          const a = amp[seg] !== undefined ? amp[seg] : 0;
          amp[seg] = target > a ? target : a * 0.78 + target * 0.22;
          energy += amp[seg];
          const len = 3 * dpr + amp[seg] * reach;
          const tipX = px + e.nx * len;
          const tipY = py + e.ny * len;
          const grad = ctx.createLinearGradient(px, py, tipX, tipY);
          grad.addColorStop(0, "rgba(0, 229, 255, 0.95)");
          grad.addColorStop(1, "rgba(120, 245, 255, 0.0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = thickness;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
          seg += 1;
        }
      }
      ctx.shadowBlur = 0;
      setEnergy(Math.min(1, (energy / BARS) * (0.7 + widthSm * 0.5)));
      raf = requestAnimationFrame(draw);
    };

    if (reduced()) {
      setEnergy(0.3);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      setEnergy(0);
    };
  }, [playing]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ease-out",
        playing ? "opacity-100" : "opacity-0",
      )}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
