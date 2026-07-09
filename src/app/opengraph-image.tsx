import { ImageResponse } from "next/og";

export const alt = "CalebZ Mastering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "flex-start",
        background: "#07090a",
        color: "#f4f6f7",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ color: "#48e9ff", fontSize: 26, letterSpacing: "0.12em" }}>
        MASTERING • SEATTLE
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{ fontSize: 92, fontWeight: 700, letterSpacing: "-0.04em" }}
        >
          Hear the difference.
        </div>
        <div style={{ color: "#a8b0b3", fontSize: 34 }}>
          Full-length before-and-after masters by CalebZ.
        </div>
      </div>
      <div style={{ color: "#48e9ff", fontSize: 30 }}>
        calebz-mastering.vercel.app
      </div>
    </div>,
    size,
  );
}
