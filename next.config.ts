import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler (stable 1.0) auto-memoizes every component and hook at build
  // time, so the codebase carries no manual useMemo/useCallback/React.memo. Next
  // runs it through an SWC pre-pass that only touches files with JSX/Hooks, so
  // build cost stays small. Requires babel-plugin-react-compiler (devDep).
  experimental: {
    reactCompiler: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
