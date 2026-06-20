// A tiny store that lifts the live audio tap out of the modal player so a
// page-level background can react to whatever is playing (plan/28). The player
// publishes its stereo reader and playing state; the background subscribes. Kept
// dependency-free so it can be read inside a rAF without re-rendering.

export type StereoRead = (l: Float32Array, r: Float32Array) => boolean;

let readFn: StereoRead | null = null;
let playing = false;
const subscribers = new Set<() => void>();

// The player calls this on play, pause, and unmount.
export function publishAudio(read: StereoRead | null, isPlaying: boolean) {
  readFn = isPlaying ? read : null;
  playing = isPlaying && read != null;
  subscribers.forEach((f) => f());
}

// Read inside the animation loop; null when nothing is playing.
export function getStereoRead(): StereoRead | null {
  return readFn;
}

// useSyncExternalStore-shaped: snapshot is the boolean playing flag.
export const audioPlayingStore = {
  subscribe(f: () => void) {
    subscribers.add(f);
    return () => {
      subscribers.delete(f);
    };
  },
  getSnapshot() {
    return playing;
  },
  getServerSnapshot() {
    return false;
  },
};
