"use client";

import { useEffect, useRef, useState } from "react";

export type ABSide = "before" | "after";

// Time-domain window the goniometer reads per channel.
export const STEREO_FFT = 2048;

type Graph = {
  ctx: AudioContext;
  left: AnalyserNode;
  right: AnalyserNode;
};

function AudioCtx(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

export type UseABAudio = {
  playing: boolean;
  currentTime: number;
  duration: number;
  side: ABSide;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  // Instant, gapless source switch at the current playhead position.
  setSide: (side: ABSide) => void;
  // Fill L and R time-domain buffers from the audible side; false if not ready.
  readStereo: (l: Float32Array, r: Float32Array) => boolean;
  // Fill L and R byte frequency buffers from the audible side; false if not ready.
  readFrequency: (l: Uint8Array, r: Uint8Array) => boolean;
};

// One play head, two sources. Playback elements are created on first play
// and kept at the same currentTime. Only the active side is audible;
// the other is muted but playing in lockstep, so flipping the toggle is a
// gapless switch at the identical position (plan/23). Each side carries a
// level-match gain so the only audible change is the master, never volume.
export function useABAudio(
  beforeSrc: string,
  afterSrc: string,
  gain: { before: number; after: number } = { before: 1, after: 1 },
) {
  const refs = useRef<Record<ABSide, HTMLAudioElement | null>>({
    before: null,
    after: null,
  });
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [side, setSideState] = useState<ABSide>("before");
  const sideRef = useRef<ABSide>("before");
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    setDuration(0);
    const probe = new Audio();
    probe.preload = "metadata";
    const update = () => {
      if (Number.isFinite(probe.duration)) setDuration(probe.duration);
    };
    probe.addEventListener("loadedmetadata", update);
    probe.addEventListener("durationchange", update);
    probe.src = beforeSrc;
    update();
    return () => {
      probe.removeEventListener("loadedmetadata", update);
      probe.removeEventListener("durationchange", update);
      probe.removeAttribute("src");
    };
  }, [beforeSrc]);

  // Build the analyser graph once, on first play (a user gesture, so the
  // AudioContext is allowed to start). Both sources feed one channel splitter;
  // the muted side outputs silence, so the analysers always read the audible
  // side. This is what powers the live stereo field (plan/27).
  const setupGraph = () => {
    if (graphRef.current) return;
    const Ctx = AudioCtx();
    const { before, after } = refs.current;
    if (!Ctx || !before || !after) return;
    try {
      const ctx = new Ctx();
      const splitter = ctx.createChannelSplitter(2);
      const left = ctx.createAnalyser();
      const right = ctx.createAnalyser();
      left.fftSize = STEREO_FFT;
      right.fftSize = STEREO_FFT;
      splitter.connect(left, 0);
      splitter.connect(right, 1);
      for (const el of [before, after]) {
        const src = ctx.createMediaElementSource(el);
        src.connect(ctx.destination);
        src.connect(splitter);
      }
      graphRef.current = { ctx, left, right };
    } catch {
      graphRef.current = null;
    }
  };

  // Fill the provided buffers with the live L and R samples. Returns false when
  // there is no analyser yet (no play, or no Web Audio), so the field idles.
  const readStereo = (l: Float32Array, r: Float32Array) => {
    const g = graphRef.current;
    if (!g) return false;
    g.left.getFloatTimeDomainData(l as Float32Array<ArrayBuffer>);
    g.right.getFloatTimeDomainData(r as Float32Array<ArrayBuffer>);
    return true;
  };

  // Byte frequency spectrum per channel for the band visualizer. Same analyser
  // nodes as the goniometer, read in the frequency domain instead of time.
  const readFrequency = (l: Uint8Array, r: Uint8Array) => {
    const g = graphRef.current;
    if (!g) return false;
    g.left.getByteFrequencyData(l as Uint8Array<ArrayBuffer>);
    g.right.getByteFrequencyData(r as Uint8Array<ArrayBuffer>);
    return true;
  };

  const apply = (active: ABSide) => {
    const { before, after } = refs.current;
    if (before) before.volume = active === "before" ? gain.before : 0;
    if (after) after.volume = active === "after" ? gain.after : 0;
  };

  const ensure = () => {
    const make = (src: string, primary: boolean) => {
      const el = new Audio();
      el.preload = "none";
      el.src = src;
      if (primary) {
        el.addEventListener("timeupdate", () => setCurrentTime(el.currentTime));
        el.addEventListener("durationchange", () =>
          setDuration(Number.isFinite(el.duration) ? el.duration : 0),
        );
        el.addEventListener("play", () => setPlaying(true));
        el.addEventListener("pause", () => setPlaying(false));
        el.addEventListener("ended", () => setPlaying(false));
      }
      return el;
    };
    if (!refs.current.before) refs.current.before = make(beforeSrc, true);
    if (!refs.current.after) refs.current.after = make(afterSrc, false);
    apply(sideRef.current);
    return refs.current;
  };

  useEffect(() => {
    const elements = refs.current;
    return () => {
      (["before", "after"] as ABSide[]).forEach((s) => {
        const el = elements[s];
        if (el) {
          el.pause();
          el.removeAttribute("src");
          el.load();
        }
        elements[s] = null;
      });
      void graphRef.current?.ctx.close();
      graphRef.current = null;
    };
  }, []);

  const play = async () => {
    const { before, after } = ensure();
    setupGraph();
    void graphRef.current?.ctx.resume();
    // Re-sync the muted side to the audible side before resuming.
    if (before && after) after.currentTime = before.currentTime;
    await Promise.all([before?.play(), after?.play()]);
  };

  const pause = () => {
    refs.current.before?.pause();
    refs.current.after?.pause();
  };

  const toggle = () => {
    if (refs.current.before && !refs.current.before.paused) pause();
    else void play();
  };

  const seek = (time: number) => {
    const { before, after } = refs.current;
    const target = before ?? after;
    if (!target) return;
    // If the track had already finished, scrubbing to a new spot should resume
    // playback rather than make the artist press play again.
    const wasEnded =
      target.ended ||
      (target.duration > 0 && target.currentTime >= target.duration - 0.05);
    const t = Math.max(0, Math.min(time, target.duration || time));
    if (before) before.currentTime = t;
    if (after) after.currentTime = t;
    setCurrentTime(t);
    if (wasEnded) {
      if (before && after) after.currentTime = before.currentTime;
      void before?.play();
      void after?.play();
    }
  };

  const setSide = (next: ABSide) => {
    sideRef.current = next;
    setSideState(next);
    const { before, after } = refs.current;
    // Align the side we are switching to with the audible playhead.
    if (before && after) {
      const src = next === "after" ? before : after;
      const dst = next === "after" ? after : before;
      dst.currentTime = src.currentTime;
    }
    apply(next);
  };

  return {
    playing,
    currentTime,
    duration,
    side,
    play,
    pause,
    toggle,
    seek,
    setSide,
    readStereo,
    readFrequency,
  } satisfies UseABAudio;
}
