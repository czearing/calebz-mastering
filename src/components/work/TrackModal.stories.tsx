import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { TrackModal } from "./TrackModal";
import { placeholderPair } from "@/content/audio";
import type { Track } from "@/content";

const track: Track = {
  id: "first-light",
  title: "First Light",
  artist: "Kessler",
  genres: ["Techno"],
  cover: "/work/for-me.jpg",
  audio: placeholderPair(1),
};

const meta: Meta<typeof TrackModal> = {
  title: "Work/TrackModal",
  component: TrackModal,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof TrackModal>;

// Named so the hook lives in a real component (react-hooks/rules-of-hooks).
function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <TrackModal
        track={track}
        open={open}
        triggerRect={null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

// Open the native dialog; Escape, backdrop, and Close all dismiss it.
export const Default: Story = {
  render: () => <DialogDemo />,
};
