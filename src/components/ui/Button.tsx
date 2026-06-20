import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost" | "link";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] " +
  "text-label font-mono uppercase tracking-[0.06em] transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  // One bright cyan for every primary action. Hover deepens the fill but
  // keeps the dark foreground, so contrast stays above 4.5:1 (white on
  // cyan-dim falls to ~4.0 and fails AA). See plan/13.
  primary: "bg-cyan px-5 py-3 text-bg hover:bg-cyan-dim",
  ghost:
    "border border-line px-5 py-3 text-text hover:border-cyan hover:text-cyan",
  link: "px-1 py-1 text-cyan underline-offset-4 hover:underline",
};

// Reference primitive. Every later UI component follows this pattern:
// typed props, tokens only, no inline magic values, forwardRef, under 60 lines.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className, type, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(base, variants[variant], className)}
        {...rest}
      />
    );
  },
);
