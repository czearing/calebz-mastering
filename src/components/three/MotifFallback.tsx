import { colorHex } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export type MotifFallbackProps = {
  className?: string;
};

// Pure CSS static frame of the after-state terrain. Shown when WebGL is
// unavailable, while the canvas chunk loads (Suspense fallback), and as the
// base layer the canvas paints over. No JS, no animation, costs nothing, paints
// before LCP. Decorative only, so aria-hidden.
export function MotifFallback({ className }: MotifFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `linear-gradient(90deg, ${colorHex.bg} 0%, transparent 68%), radial-gradient(85% 72% at 78% 68%, ${colorHex.cyanDim}28 0%, transparent 62%), repeating-linear-gradient(0deg, ${colorHex.cyan}0a 0px, ${colorHex.cyan}0a 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, ${colorHex.cyan}08 0px, ${colorHex.cyan}08 1px, transparent 1px, transparent 34px)`,
        backgroundColor: colorHex.bg,
      }}
    />
  );
}
