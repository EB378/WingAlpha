import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";
import Cal from "@/components/Cal";

export default async function ProtectedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams; // Resolve and extract locale
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/${locale}/sign-in`);
  }

  const { data: bookings, error } = await supabase.from("bookings").select();

  if (error) {
    console.error("Error fetching bookings:", error.message);
  }

  const userForCal = {
    id: user.id,
    email: user.email || "", // Fallback to empty string if email is undefined
  };

  return (
    <div className="flex-1 w-screen flex flex-col gap-12 my-4">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4 px-14">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border px-14 max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>

        {/* Pass only data */}
        <Cal user={userForCal} initialBookings={bookings || []} />
      </div>
    </div>
  );
}