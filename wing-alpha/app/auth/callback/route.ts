import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/"; // Default to root if no redirect is specified

    if (!code) {
      console.error("Missing authorization code in URL.");
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_code`);
    }

    const supabase = await createClient();

    // Exchange the authorization code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
    }

    // Handle environment-based origin determination
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error("Unexpected error in GET handler:", error);
    return NextResponse.redirect("/auth/auth-code-error?error=unexpected_error");
  }
}
