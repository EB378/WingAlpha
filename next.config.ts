import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin();
const withPWA = withPWAInit({
  dest: "public",
});

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disable Next.js image optimization
  },
};

export default withPWA(withNextIntl(nextConfig));
