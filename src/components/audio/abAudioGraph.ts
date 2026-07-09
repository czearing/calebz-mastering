export const STEREO_FFT = 2048;

export type ABGraph = {
  ctx: AudioContext;
  left: AnalyserNode;
  right: AnalyserNode;
};

function audioContext(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

export function createABGraph(
  before: HTMLAudioElement,
  after: HTMLAudioElement,
): ABGraph | null {
  const AudioContextClass = audioContext();
  if (!AudioContextClass) return null;

  try {
    const ctx = new AudioContextClass();
    const splitter = ctx.createChannelSplitter(2);
    const left = ctx.createAnalyser();
    const right = ctx.createAnalyser();
    left.fftSize = STEREO_FFT;
    right.fftSize = STEREO_FFT;
    splitter.connect(left, 0);
    splitter.connect(right, 1);
    for (const element of [before, after]) {
      const source = ctx.createMediaElementSource(element);
      source.connect(ctx.destination);
      source.connect(splitter);
    }
    return { ctx, left, right };
  } catch {
    return null;
  }
}
