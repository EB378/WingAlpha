import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: bookings, error } = await (await supabase)
      .from("bookings")
      .select("id, title, details, starttime, endtime, created_at, user");

    if (error) {
      console.error("Error fetching bookings:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { title, details, starttime, endtime, user } = await req.json();

    if (!title || !starttime || !endtime || !user) {
      return NextResponse.json(
        { error: "Missing required fields: title, starttime, endtime, user are mandatory." },
        { status: 400 }
      );
    }

    const { data, error } = await (await supabase).from("bookings").insert({
      title,
      details,
      starttime,
      endtime,
      user,
    });

    if (error) {
      console.error("Error creating booking:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Booking created successfully.", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error during POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
