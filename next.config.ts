import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    /**
     * Pin the workspace root to this project.
     *
     * There is a stray `pnpm-lock.yaml` in the home directory, which makes
     * Turbopack otherwise infer $HOME as the root — it then watches far more
     * than this project, and the extra churn makes its incremental dev state
     * unreliable.
     */
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
