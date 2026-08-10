import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // The repository owns a protected root AGENTS.md. Keep Next from injecting
  // its generated agent-rules block into that control-plane document.
  agentRules: false,
};

export default nextConfig;
