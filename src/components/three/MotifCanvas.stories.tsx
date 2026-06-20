import type { Meta, StoryObj } from "@storybook/react";
import { MotifCanvas } from "./MotifCanvas";
import { MotifFallback } from "./MotifFallback";

// Story pattern, title under "Three/<Name>". The motif is decorative terrain;
// these stories frame it in a tall box so the scroll-driven morph and the
// offscreen pause are observable. The a11y addon should report no violations
// because the whole thing is aria-hidden.
const meta: Meta<typeof MotifCanvas> = {
  title: "Three/MotifCanvas",
  component: MotifCanvas,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof MotifCanvas>;

export const Default: Story = {
  render: () => (
    <div style={{ height: "100vh", background: "#060708" }}>
      <MotifCanvas />
    </div>
  ),
};

// The hard fallback: what every visitor sees if WebGL is unavailable, low
// power, or while the canvas chunk is still loading.
export const StaticFallback: StoryObj<typeof MotifFallback> = {
  render: () => (
    <div style={{ position: "relative", height: "100vh", background: "#060708" }}>
      <MotifFallback />
    </div>
  ),
};
