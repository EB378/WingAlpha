import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "fi"],  // Supported locales
  defaultLocale: "en",    // Default fallback locale
});

export const config = {
  matcher: ["/", "/(fi|en)/:path*"], // Match the root and locale-specific paths
};
