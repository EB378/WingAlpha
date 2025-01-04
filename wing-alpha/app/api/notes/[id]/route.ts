import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract the ID from the URL

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid Note ID format." },
        { status: 400 }
      );
    }

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
      .neq("id", parseInt(id, 10))
      .or(`and(starttime.lte.${endtime},endtime.gte.${starttime})`);

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

    const { error } = await supabase
      .from("notes")
      .update({ title, details, starttime, endtime, userid })
      .eq("id", parseInt(id, 10));

    if (error) {
      console.error("Error updating note:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Note updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract the ID from the URL

    console.log("Received DELETE request for ID:", id);

    if (!id || isNaN(Number(id))) {
      console.error("Invalid Note ID format:", id);
      return NextResponse.json(
        { error: "Invalid Note ID format." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", parseInt(id, 10));

    if (error) {
      console.error("Error deleting note:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Note deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
