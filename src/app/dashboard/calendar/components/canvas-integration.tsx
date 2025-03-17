"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, Check, RefreshCw, AlertCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase-client";

interface IcsEvent {
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  uid: string;
  location?: string;
}

export default function CanvasIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState("Never");
  const supabase = createClient();

  const handleConnect = () => {
    setShowDialog(true);
  };

  const handleSubmitFeedUrl = async () => {
    if (!feedUrl) {
      setError("Please enter a valid Canvas calendar feed URL");
      return;
    }

    if (!feedUrl.includes(".ics")) {
      setError("URL must be an ICS calendar feed from Canvas");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Use our server-side API to fetch the ICS file to avoid CORS issues
      const response = await fetch("/api/canvas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: feedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch calendar feed");
      }

      const { icsData } = await response.json();

      // Parse and store the events
      const events = parseIcsData(icsData);
      await storeEvents(events);

      setIsConnected(true);
      setLastSynced(new Date().toLocaleString());
      setShowDialog(false);
    } catch (error: any) {
      console.error("Error connecting to Canvas:", error);
      setError(
        error.message ||
          "Failed to connect to Canvas. Please check the URL and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const parseIcsData = (icsData: string): IcsEvent[] => {
    // Enhanced ICS parsing logic
    const events: IcsEvent[] = [];
    const lines = icsData.split(/\r\n|\n|\r/);
    let currentEvent: Partial<IcsEvent> | null = null;
    let continuationLine = "";

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Handle line continuations (lines that start with a space or tab)
      if (line.startsWith(" ") || line.startsWith("\t")) {
        continuationLine += line.trim();
        continue;
      } else if (continuationLine) {
        // Process the previous continuation line
        line = continuationLine;
        continuationLine = "";
      }

      if (line === "BEGIN:VEVENT") {
        currentEvent = {};
      } else if (line === "END:VEVENT" && currentEvent) {
        // Only add events that have at least a title and start time
        if (currentEvent.title && currentEvent.start_time) {
          // Generate a UID if none exists
          if (!currentEvent.uid) {
            currentEvent.uid = `canvas-import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          }
          events.push(currentEvent as IcsEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        // Handle different ICS properties
        if (line.startsWith("SUMMARY:")) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith("DESCRIPTION:")) {
          currentEvent.description = line.substring(12);
        } else if (line.startsWith("DTSTART")) {
          // Handle different date formats
          const colonIndex = line.indexOf(":");
          if (colonIndex !== -1) {
            const formattedDate = formatIcsDate(line.substring(colonIndex + 1));
            // Only assign if not null to satisfy TypeScript
            if (formattedDate !== null) {
              currentEvent.start_time = formattedDate;
            }
          }
        } else if (line.startsWith("DTEND")) {
          const colonIndex = line.indexOf(":");
          if (colonIndex !== -1) {
            const formattedDate = formatIcsDate(line.substring(colonIndex + 1));
            // Only assign if not null to satisfy TypeScript
            if (formattedDate !== null) {
              currentEvent.end_time = formattedDate;
            }
          }
        } else if (line.startsWith("UID:")) {
          currentEvent.uid = line.substring(4);
        } else if (line.startsWith("LOCATION:")) {
          currentEvent.location = line.substring(9);
        }
      }
    }

    return events;
  };

  const formatIcsDate = (icsDate: string): string | null => {
    // Handle different ICS date formats

    // Format: 20240710T150000Z (basic format)
    if (icsDate.includes("T") && !icsDate.includes("-")) {
      try {
        const year = icsDate.substring(0, 4);
        const month = icsDate.substring(4, 6);
        const day = icsDate.substring(6, 8);

        const timeIndex = icsDate.indexOf("T");
        if (timeIndex !== -1 && timeIndex + 6 < icsDate.length) {
          const hour = icsDate.substring(timeIndex + 1, timeIndex + 3);
          const minute = icsDate.substring(timeIndex + 3, timeIndex + 5);
          const second = icsDate.substring(timeIndex + 5, timeIndex + 7);

          return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
        } else {
          // Date only
          return `${year}-${month}-${day}T00:00:00Z`;
        }
      } catch (e) {
        console.error("Error parsing ICS date:", e, icsDate);
        return null;
      }
    }

    // Format: 2024-07-10T15:00:00Z (already ISO format)
    else if (icsDate.includes("T") && icsDate.includes("-")) {
      return icsDate;
    }

    // Format: 20240710 (date only)
    else if (icsDate.length >= 8 && !icsDate.includes("-")) {
      try {
        const year = icsDate.substring(0, 4);
        const month = icsDate.substring(4, 6);
        const day = icsDate.substring(6, 8);
        return `${year}-${month}-${day}T00:00:00Z`;
      } catch (e) {
        console.error("Error parsing ICS date:", e, icsDate);
        return null;
      }
    }

    // Unknown format
    console.warn("Unknown ICS date format:", icsDate);
    return null;
  };

  const storeEvents = async (events: IcsEvent[]) => {
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error("Authentication failed: " + authError.message);
      }

      if (!userData || !userData.user) {
        console.error("No user data found", userData);
        throw new Error("User not authenticated");
      }

      const userId = userData.user.id;

      // Store each event in the database
      for (const event of events) {
        // Check if this is an assignment or exam
        const isAssignment =
          event.title.toLowerCase().includes("assignment") ||
          event.title.toLowerCase().includes("due") ||
          event.title.toLowerCase().includes("submit");

        if (isAssignment) {
          // Store as a task
          await supabase.from("tasks").upsert(
            {
              title: event.title,
              description: event.description || "",
              due_date: event.start_time,
              status: "todo",
              priority: "medium",
              user_id: userId,
              source: "canvas",
              external_id: event.uid,
            },
            { onConflict: "external_id" },
          );
        } else {
          // Store as a calendar event (if you have a separate table for this)
          // For now, we'll store everything as tasks
          await supabase.from("tasks").upsert(
            {
              title: event.title,
              description: event.description || "",
              due_date: event.start_time,
              status: "todo",
              priority: "low",
              user_id: userId,
              source: "canvas",
              external_id: event.uid,
            },
            { onConflict: "external_id" },
          );
        }
      }
    } catch (error) {
      console.error("Authentication error in storeEvents:", error);
      throw error;
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // Re-fetch the calendar feed
      await handleSubmitFeedUrl();
      setLastSynced(new Date().toLocaleString());
    } catch (error: any) {
      console.error("Error syncing with Canvas:", error);
      setError("Failed to sync with Canvas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Canvas Integration</CardTitle>
          <CardDescription>
            Import your Canvas calendar and assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isConnected ? (
              <div className="rounded-md border p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm">
                    Connect your Canvas account to import deadlines and
                    assignments automatically.
                  </p>
                  <Button
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleConnect}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="mr-2 h-4 w-4" /> Connect Canvas
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Connected to Canvas
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Last synced: {lastSynced}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40"
                    onClick={handleSync}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Canvas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-url">Canvas Calendar Feed URL</Label>
              <Input
                id="canvas-url"
                placeholder="https://canvas.instructure.com/feeds/calendars/user_abc123.ics"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                <div>To find your Canvas calendar feed URL:</div>
                <ol className="list-decimal list-inside mt-1 ml-2">
                  <li>Go to Calendar in Canvas</li>
                  <li>Click on "Calendar Feed" at the bottom right</li>
                  <li>Copy the URL provided</li>
                </ol>
              </div>
              {error && (
                <div className="flex items-center text-red-600 text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSubmitFeedUrl}
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
