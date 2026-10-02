import type { NextConfig } from "next";

// NOTE: `output: "export"` was removed — Google login (Auth.js) needs
// API routes (`/api/auth/...`), which static export disables.
// Vercel hosts this dynamic mode natively; no extra config needed.
const nextConfig: NextConfig = {};

export default nextConfig;
