"use client";

import { useEffect, useRef, useState } from "react";

export type UseAudio = {
  playing: boolean;
  currentTime: number;
  duration: number;
  ready: boolean;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
};

// Lazy audio engine. The HTMLAudioElement is created on the first play,
// not on mount, so no audio bytes are fetched until the visitor asks
// for them (plan/11). preload="none" keeps the initial load clean; the
// browser streams via range requests once src is set and play is called.
export function useAudio(src: string): UseAudio {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  const ensure = (): HTMLAudioElement => {
    let el = ref.current;
    if (!el) {
      el = new Audio();
      el.preload = "none";
      el.src = src;
      el.addEventListener("timeupdate", () => setCurrentTime(el!.currentTime));
      el.addEventListener("durationchange", () =>
        setDuration(Number.isFinite(el!.duration) ? el!.duration : 0),
      );
      el.addEventListener("play", () => setPlaying(true));
      el.addEventListener("pause", () => setPlaying(false));
      el.addEventListener("ended", () => setPlaying(false));
      el.addEventListener("canplay", () => setReady(true));
      ref.current = el;
    }
    return el;
  };

  // Keep src in sync if it changes after the engine exists.
  useEffect(() => {
    if (ref.current && ref.current.src !== src) {
      ref.current.src = src;
      setReady(false);
    }
  }, [src]);

  // Tear the element down on unmount so no audio leaks across pages.
  useEffect(() => {
    return () => {
      const el = ref.current;
      if (el) {
        el.pause();
        el.removeAttribute("src");
        el.load();
        ref.current = null;
      }
    };
  }, []);

  const play = async () => {
    await ensure().play();
  };

  const pause = () => ref.current?.pause();

  const toggle = () => {
    if (ref.current?.paused === false) pause();
    else void play();
  };

  const seek = (time: number) => {
    const el = ensure();
    el.currentTime = Math.max(0, Math.min(time, el.duration || time));
    setCurrentTime(el.currentTime);
  };

  return { playing, currentTime, duration, ready, play, pause, toggle, seek };
}
