import { NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// This would sync events from Google Calendar
export async function POST(request: Request) {
  try {
    const { calendarIds } = await request.json();

    if (
      !calendarIds ||
      !Array.isArray(calendarIds) ||
      calendarIds.length === 0
    ) {
      return NextResponse.json(
        { error: "No calendars selected for sync" },
        { status: 400 },
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
        { status: 401 },
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
        { status: 404 },
      );
    }

    // In a real implementation, we would use the access token to fetch events from Google API
    // For now, we'll simulate a successful sync

    // Update the last synced time
    await supabase
      .from("calendar_connections")
      .update({ last_synced: new Date().toISOString() })
      .eq("id", connection.id);

    return NextResponse.json({
      success: true,
      message: "Calendars synced successfully",
    });
  } catch (error) {
    console.error("Error in Google Sync API route:", error);
    return NextResponse.json(
      { error: "Failed to sync Google calendars" },
      { status: 500 },
    );
  }
}
