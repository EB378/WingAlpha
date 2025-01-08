import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const id = params.id;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid Booking ID format." }, { status: 400 });
    }

    const { title, details, starttime, endtime, User } = await req.json();

    if (!title || !starttime || !endtime || !User) {
      return NextResponse.json(
        { error: "Missing required fields: title, starttime, endtime, User are mandatory." },
        { status: 400 }
      );
    }

    const { error } = await (await supabase)
      .from("bookings")
      .update({ title, details, starttime, endtime, User })
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const id = params.id;

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
