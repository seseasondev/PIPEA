import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera un servidor Node autocontenido (.next/standalone) para correr en
  // Docker o en el servidor institucional, sin depender de Vercel.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
