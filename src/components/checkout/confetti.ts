// A one-shot celebratory burst: emoji particles fire out from an origin point and
// fall under gravity with spin and drift, drawn on a throwaway full-screen canvas
// that removes itself once the last particle leaves the screen. Self-contained
// (its own overlay canvas, pointer-events none) and a no-op under reduced motion,
// so it never blocks input or fights the rest of the page. See plan/32.

const EMOJIS = ["🎉", "🎊", "✨", "🥳", "💫", "🔊"];
const GRAVITY = 0.28;
const DRAG = 0.99;
const COUNT = 90;
const MAX_MS = 6000;

export type ConfettiOrigin = { x: number; y: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  emoji: string;
};

export function burstConfetti(origin?: ConfettiOrigin): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.ceil(w * dpr);
  canvas.height = Math.ceil(h * dpr);
  canvas.setAttribute(
    "style",
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999",
  );
  canvas.setAttribute("aria-hidden", "true");
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);

  const ox = origin?.x ?? w / 2;
  const oy = origin?.y ?? h / 3;
  const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.6;
    const speed = 4 + Math.random() * 9;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6, // bias upward so they arc, then fall
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
      size: 16 + Math.random() * 18,
      emoji: EMOJIS[i % EMOJIS.length],
    };
  });

  let raf = 0;
  let started = 0;
  const stop = () => {
    cancelAnimationFrame(raf);
    canvas.remove();
  };

  const tick = (now: number) => {
    if (!started) started = now;
    ctx.clearRect(0, 0, w, h);
    let alive = 0;
    for (const p of particles) {
      p.vy += GRAVITY;
      p.vx *= DRAG;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y < h + 40) alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
    if (alive > 0 && now - started < MAX_MS) {
      raf = requestAnimationFrame(tick);
    } else {
      stop();
    }
  };
  raf = requestAnimationFrame(tick);
}
