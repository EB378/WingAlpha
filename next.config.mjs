/** @type {import('next').NextConfig} */

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  images: {
    unoptimized: true, // Disable Next.js image optimisation
  },
};

export default withNextIntl(nextConfig);

