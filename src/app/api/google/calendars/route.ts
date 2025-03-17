import { NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// This would fetch the user's Google calendars
export async function GET(request: Request) {
  try {
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

    // In a real implementation, we would use the access token to fetch calendars from Google API
    // For now, we'll return mock data
    const mockCalendars = [
      { id: "primary", name: "Primary Calendar" },
      { id: "work", name: "Work" },
      { id: "school", name: "School" },
      { id: "birthdays", name: "Birthdays" },
    ];

    return NextResponse.json({ calendars: mockCalendars });
  } catch (error) {
    console.error("Error in Google Calendars API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google calendars" },
      { status: 500 },
    );
  }
}
