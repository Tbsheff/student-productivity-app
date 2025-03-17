import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes(".ics")) {
      return NextResponse.json(
        { error: "Invalid Canvas calendar feed URL" },
        { status: 400 },
      );
    }

    // Fetch the ICS file server-side to avoid CORS issues
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch calendar feed: ${response.statusText}` },
        { status: response.status },
      );
    }

    const icsData = await response.text();

    return NextResponse.json({ icsData });
  } catch (error) {
    console.error("Error in Canvas API route:", error);
    return NextResponse.json(
      { error: "Failed to process Canvas calendar feed" },
      { status: 500 },
    );
  }
}
