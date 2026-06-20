import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { PageAudioField } from "./PageAudioField";
import { publishAudio } from "@/lib/audioReactive";
import { STEREO_FFT } from "./useABAudio";

// Publish a synthetic wide stereo signal so the field blooms in isolation,
// without a real AudioContext.
function Demo() {
  useEffect(() => {
    let phase = 0;
    const read = (l: Float32Array, r: Float32Array) => {
      phase += 0.25;
      for (let i = 0; i < STEREO_FFT; i++) {
        const t = i * 0.06 + phase;
        l[i] = Math.sin(t) * 0.7;
        r[i] = Math.sin(t + Math.PI / 2) * 0.7;
      }
      return true;
    };
    publishAudio(read, true);
    return () => publishAudio(null, false);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "70vh", background: "#060708" }}>
      <PageAudioField />
      <h1
        style={{
          position: "relative",
          color: "#F4F6F7",
          fontSize: 64,
          padding: 48,
          maxWidth: 600,
        }}
      >
        Hear the difference.
      </h1>
    </div>
  );
}

const meta: Meta<typeof PageAudioField> = {
  title: "Audio/PageAudioField",
  component: PageAudioField,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof PageAudioField>;

// The page-scale goniometer blooming behind a headline, text stays legible.
export const Playing: Story = {
  render: () => <Demo />,
};
