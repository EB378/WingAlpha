import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Missing 'date' query parameter." },
        { status: 400 }
      );
    }

    const startOfDay = new Date(`${date}T00:00:00Z`).toISOString();
    const endOfDay = new Date(`${date}T23:59:59Z`).toISOString();

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .gte("starttime", startOfDay)
      .lte("starttime", endOfDay);

    if (error) {
      console.error("Error fetching notes:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { title, details, starttime, endtime, userid } = await req.json();

    if (!title || !starttime || !endtime || !userid) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check for overlapping notes
    const { data: overlappingNotes, error: overlapError } = await supabase
      .from("notes")
      .select("*")
      .or(
        `and(starttime.lte.${endtime},endtime.gte.${starttime})`
      );

    if (overlapError) {
      console.error("Error checking overlaps:", overlapError.message);
      return NextResponse.json({ error: overlapError.message }, { status: 500 });
    }

    if (overlappingNotes && overlappingNotes.length > 0) {
      return NextResponse.json(
        { error: "The specified time slot overlaps with an existing booking." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notes")
      .insert([{ title, details, starttime, endtime, userid }]);

    if (error) {
      console.error("Error creating note:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}