"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { audioPlayingStore, getStereoRead } from "@/lib/audioReactive";
import { STEREO_FFT } from "./useABAudio";
import { drawStereoFrame, newFieldState } from "./stereoFieldFrame";

// While a track plays the page carries a soft full-bleed goniometer (plan/28).
// It plots the real left vs right samples as a Lissajous on rotated axes
// (vertical = mono, horizontal = side), so the SHAPE is the stereo width: a
// narrow mix pulls to a faint column, a wide master opens into a cloud. It is a
// real meter, not a loudness pulse. Cyan, additive, blurred soft and kept low so
// it reads as quiet atmosphere. Full-viewport and resize-safe. The smoothed
// level is published as --audio-energy so the cards glow gently with it.
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

export function PageAudioField() {
  const playing = useSyncExternalStore(
    audioPlayingStore.subscribe,
    audioPlayingStore.getSnapshot,
    audioPlayingStore.getServerSnapshot,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!playing) {
      setEnergy(0);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // The field is blurred 13px at 0.66 opacity, so device-pixel sharpness is
    // invisible here. Render the backing store at <=1 device pixel to roughly
    // halve the per-frame fill cost on HiDPI screens with no visible change.
    const dpr = Math.min(1, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth * dpr);
      canvas.height = Math.ceil(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    if (reduced()) {
      setEnergy(0.35);
      const w = canvas.width;
      const h = canvas.height;
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.4);
      g.addColorStop(0, "rgba(0, 229, 255, 0.18)");
      g.addColorStop(1, "rgba(0, 229, 255, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      return () => {
        window.removeEventListener("resize", resize);
        setEnergy(0);
      };
    }

    const l = new Float32Array(STEREO_FFT);
    const r = new Float32Array(STEREO_FFT);
    // The smoothed level and stereo width live in the shared frame state, eased
    // so flipping to the wider master makes the field bloom open over about a
    // second. The level is published as --audio-energy for the cards.
    const state = newFieldState();
    let raf = 0;

    const draw = () => {
      if (!document.hidden) {
        const drew = drawStereoFrame(
          ctx,
          canvas.width,
          canvas.height,
          l,
          r,
          getStereoRead(),
          state,
        );
        if (drew) {
          setEnergy(state.energy * 0.6);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      setEnergy(0);
    };
  }, [playing]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700 ease-out"
      style={{ opacity: playing ? 0.66 : 0 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full [filter:blur(13px)]" />
    </div>
  );
}
