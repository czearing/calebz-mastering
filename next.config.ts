import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler (stable 1.0) auto-memoizes every component and hook at build
  // time, so the codebase carries no manual useMemo/useCallback/React.memo. Next
  // runs it through an SWC pre-pass that only touches files with JSX/Hooks, so
  // build cost stays small. Requires babel-plugin-react-compiler (devDep).
  experimental: {
    reactCompiler: true,
  },
  images: {
    // Cloudflare Pages has no Node image optimizer, so serve images as-is.
    // next/image still sets explicit width and height to reserve space and
    // prevent layout shift; we just skip the on-demand optimization endpoint.
    unoptimized: true,
  },
};

export default nextConfig;
