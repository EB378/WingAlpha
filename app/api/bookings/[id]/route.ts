import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient();

    // Extract the ID directly from the URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid Booking ID format." }, { status: 400 });
    }

    const { title, details, starttime, endtime, user } = await req.json();

    if (!title || !starttime || !endtime || !user) {
      return NextResponse.json(
        { error: "Missing required fields: title, starttime, endtime, user are mandatory." },
        { status: 400 }
      );
    }

    const { error } = await (await supabase)
      .from("bookings")
      .update({ title, details, starttime, endtime, user })
      .eq("id", parseInt(id, 10));

    if (error) {
      console.error("Error updating booking:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Booking updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient();

    // Extract the ID directly from the URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid Booking ID format." }, { status: 400 });
    }

    const { error } = await (await supabase).from("bookings").delete().eq("id", parseInt(id, 10));

    if (error) {
      console.error("Error deleting booking:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Booking deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
