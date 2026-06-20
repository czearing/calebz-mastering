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
        background: `radial-gradient(120% 80% at 50% 100%, ${colorHex.cyanDim}22 0%, ${colorHex.bg} 55%), repeating-linear-gradient(115deg, ${colorHex.cyan}14 0px, ${colorHex.cyan}14 1px, transparent 1px, transparent 9px)`,
        backgroundColor: colorHex.bg,
      }}
    />
  );
}
