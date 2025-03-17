import { NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// This would handle syncing selected Google calendars
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { calendarIds } = await request.json();

    if (!Array.isArray(calendarIds)) {
      return NextResponse.json(
        { error: "Calendar IDs must be an array" },
        { status: 400 }
      );
    }

    // Get the user from the session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get the user's Google Calendar connection
    const { data: connection } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: "No Google Calendar connection found" },
        { status: 404 }
      );
    }

    // In a real implementation, we would:
    // 1. Use the access token to fetch events from selected calendars
    // 2. Process and store the events in our database
    // For now, simulate successful sync
    
    // Update last synced timestamp
    await supabase
      .from("calendar_connections")
      .update({ last_synced: new Date().toISOString() })
      .eq("id", connection.id);

    return NextResponse.json({
      message: "Calendars synced successfully",
      calendars: calendarIds,
    });

  } catch (error) {
    console.error("Error in Google Calendar sync:", error);
    return NextResponse.json(
      { error: "Failed to sync Google calendars" },
      { status: 500 }
    );
  }
}
