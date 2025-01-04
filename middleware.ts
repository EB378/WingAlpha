import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'fi'],
  defaultLocale: 'en',
});

// Define routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings'];

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Check if the requested URL is in the list of protected routes
  const urlPath = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => urlPath.startsWith(route));

  if (isProtectedRoute) {
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Redirect unauthenticated users to the login page
      return NextResponse.redirect('/sign-in?error=unauthenticated');
    }
  }

  // Return the response for other cases
  return response;
}

// Middleware matcher configuration
export const config = {
  matcher: ['/', '/(fi|en)/:path*'], // Match root and localized routes
};
