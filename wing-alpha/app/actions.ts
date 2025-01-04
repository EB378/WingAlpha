"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const getLocaleFromHeaders = async () => {
  const referer = (await headers()).get("referer");
  if (!referer) return "/en"; // Default to `/en` if no referer is found

  const url = new URL(referer);
  const segments = url.pathname.split("/").filter(Boolean); // Split the pathname into segments
  const locale = segments[0]; // Assume the first segment is the locale

  return locale || "/en"; // Default to `/en` if no locale is detected
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const locale = await getLocaleFromHeaders();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      `/${locale}/sign-up`,
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/${locale}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", `/${locale}/sign-up`, error.message);
  } else {
    return encodedRedirect(
      "success",
      `/${locale}/sign-up`,
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  const locale = await getLocaleFromHeaders();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", `/${locale}/sign-in`, error.message);
  }

  return redirect(`/${locale}/protected`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const locale = await getLocaleFromHeaders();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect(
      "error",
      `/${locale}/forgot-password`,
      "Email is required",
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/${locale}/auth/callback?redirect_to=/${locale}/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      `/${locale}/forgot-password`,
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    `/${locale}/forgot-password`,
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const locale = await getLocaleFromHeaders();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      `/${locale}/protected/reset-password`,
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      `/${locale}/protected/reset-password`,
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      `/${locale}/protected/reset-password`,
      "Password update failed",
    );
  }

  encodedRedirect(
    "success",
    `/${locale}/protected/reset-password`,
    "Password updated",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  const locale = await getLocaleFromHeaders();
  await supabase.auth.signOut();
  return redirect(`/${locale}/sign-in`);
};


export const googleAuthAction = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Google Auth Error:", error);
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Redirect user to Google OAuth URL
  if (data?.url) {
    return redirect(data.url);
  }

  return encodedRedirect(
    "error",
    "/sign-in",
    "Failed to initialize Google authentication."
  );
};

