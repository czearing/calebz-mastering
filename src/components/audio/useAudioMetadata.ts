"use client";

import { useEffect, useState } from "react";

export function useAudioMetadata(src: string): number {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setDuration(0);
    const probe = new Audio();
    probe.preload = "metadata";
    const update = () => {
      if (Number.isFinite(probe.duration)) setDuration(probe.duration);
    };
    probe.addEventListener("loadedmetadata", update);
    probe.addEventListener("durationchange", update);
    probe.src = src;
    update();
    return () => {
      probe.removeEventListener("loadedmetadata", update);
      probe.removeEventListener("durationchange", update);
      probe.removeAttribute("src");
    };
  }, [src]);

  return duration;
}
