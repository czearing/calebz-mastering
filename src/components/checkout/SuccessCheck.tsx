// A premium order-confirmed mark: a cyan ring pops in and a check draws across
// it. Pure SVG + two CSS keyframes (cz-pop, cz-draw in globals.css), so it stays
// on the compositor and reduced motion snaps it to the finished state.
export function SuccessCheck() {
  return (
    <svg
      viewBox="0 0 52 52"
      width="72"
      height="72"
      aria-hidden
      className="shrink-0"
      style={{ animation: "cz-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <circle
        cx="26"
        cy="26"
        r="24"
        fill="color-mix(in srgb, var(--cyan) 12%, transparent)"
        stroke="var(--cyan)"
        strokeWidth="2"
      />
      <path
        d="M15 27 l7 7 l15 -15"
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 40,
          strokeDashoffset: 40,
          animation: "cz-draw 0.45s ease-out 0.25s forwards",
        }}
      />
    </svg>
  );
}
