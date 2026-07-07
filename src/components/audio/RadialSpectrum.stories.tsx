import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { RadialSpectrum } from "./RadialSpectrum";
import { publishAudio } from "@/lib/audioReactive";

function makeStereo(width: number) {
  let t = 0;
  return (l: Float32Array, r: Float32Array) => {
    t += 0.3;
    for (let i = 0; i < l.length; i += 1) {
      const p = t + i * 0.04;
      const mono = Math.sin(p) * 0.5;
      const side = Math.sin(p * 1.4) * 0.5 * width;
      l[i] = mono + side;
      r[i] = mono - side;
    }
    return true;
  };
}

function makeFreq(intensity: number) {
  let t = 0;
  return (l: Uint8Array, r: Uint8Array) => {
    t += 0.12;
    for (let b = 0; b < l.length; b += 1) {
      const decay = Math.max(0, 1 - b / (l.length * 0.55));
      const move = 0.5 + 0.5 * Math.sin(t + b * 0.04);
      const base = decay * move * 255 * intensity;
      l[b] = Math.min(255, base * (0.8 + 0.2 * Math.sin(t * 1.3 + b * 0.06)));
      r[b] = Math.min(255, base * (0.8 + 0.2 * Math.sin(t * 1.1 + b * 0.05 + 1)));
    }
    return true;
  };
}

function Demo({ width, intensity }: { width: number; intensity: number }) {
  useEffect(() => {
    publishAudio(makeStereo(width), true, makeFreq(intensity));
    return () => publishAudio(null, false);
  }, [width, intensity]);

  return (
    <div
      style={{
        width: 720,
        height: 540,
        background: "#060708",
        display: "grid",
        placeItems: "center",
      }}
    >
      <section className="relative z-[60] w-[420px] rounded-[var(--radius-md)] border border-line bg-surface">
        <RadialSpectrum playing />
        <div className="relative z-10 flex flex-col gap-4 p-5">
          <div className="h-11 w-11 rounded-full bg-cyan" />
          <div className="h-12 w-full rounded bg-line" />
          <div className="font-mono text-label text-muted">Player content</div>
        </div>
      </section>
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "Audio/RadialSpectrum",
  component: Demo,
  parameters: { layout: "centered" },
  args: { width: 0.7, intensity: 0.9 },
};

export default meta;

type Story = StoryObj<typeof Demo>;

export const WideMaster: Story = { args: { width: 0.95, intensity: 0.95 } };
export const NarrowMix: Story = { args: { width: 0.05, intensity: 0.7 } };
