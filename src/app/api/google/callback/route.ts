import { NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// This would handle the OAuth callback from Google
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 },
      );
    }

    // In a real implementation, we would exchange the code for tokens
    // For now, we'll simulate a successful token exchange

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

    // Store the connection in the database
    await supabase.from("calendar_connections").upsert({
      user_id: user.id,
      provider: "google",
      access_token: "simulated_access_token", // In real implementation, this would be the actual token
      refresh_token: "simulated_refresh_token",
      token_expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
      last_synced: new Date().toISOString(),
    });

    // Redirect back to the calendar page
    return NextResponse.redirect(new URL("/dashboard/calendar", request.url));
  } catch (error) {
    console.error("Error in Google Callback API route:", error);
    return NextResponse.json(
      { error: "Failed to process Google OAuth callback" },
      { status: 500 },
    );
  }
}
