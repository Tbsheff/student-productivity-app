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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check, RefreshCw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase-client";

export default function GoogleCalendarSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState("Never");
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [authUrl, setAuthUrl] = useState("");
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already connected to Google Calendar
    const checkConnection = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: connection } = await supabase
          .from("calendar_connections")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("provider", "google")
          .single();

        if (connection) {
          setIsConnected(true);
          setLastSynced(new Date(connection.last_synced).toLocaleString());
          // Fetch available calendars
          fetchCalendars();
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Get the auth URL from our server-side API
      const response = await fetch("/api/google/auth");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start Google OAuth flow");
      }

      const { authUrl } = await response.json();
      setAuthUrl(authUrl);
      setShowDialog(true);
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      setError(
        error.message ||
          "Failed to connect to Google Calendar. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorize = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, we would redirect to Google's OAuth page
      // For demonstration purposes, we'll simulate a successful authorization

      // Normally, you would redirect the user to the authUrl:
      // window.location.href = authUrl;

      // For this demo, we'll simulate the OAuth callback
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate the callback handling that would normally happen in the /api/google/callback route
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Store connection info
      await supabase.from("calendar_connections").upsert({
        user_id: userData.user.id,
        provider: "google",
        last_synced: new Date().toISOString(),
        access_token: "simulated_access_token",
        refresh_token: "simulated_refresh_token",
        token_expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
      });

      setIsConnected(true);
      setLastSynced(new Date().toLocaleString());
      setShowDialog(false);

      // Fetch available calendars
      await fetchCalendars();
    } catch (error) {
      console.error("Error authorizing Google Calendar:", error);
      setError(
        error.message ||
          "Failed to authorize Google Calendar. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendars = async () => {
    try {
      // Fetch calendars from our server-side API
      const response = await fetch("/api/google/calendars");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch calendars");
      }

      const { calendars: fetchedCalendars } = await response.json();

      setCalendars(fetchedCalendars);
      setSelectedCalendars(["primary", "school"]); // Default selected calendars
    } catch (error) {
      console.error("Error fetching calendars:", error);
      setError(error.message || "Failed to fetch calendars");
    }
  };

  const handleCalendarToggle = (calendarId) => {
    setSelectedCalendars((prev) => {
      if (prev.includes(calendarId)) {
        return prev.filter((id) => id !== calendarId);
      } else {
        return [...prev, calendarId];
      }
    });
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // Sync calendars using our server-side API
      const response = await fetch("/api/google/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ calendarIds: selectedCalendars }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync calendars");
      }

      setLastSynced(new Date().toLocaleString());
    } catch (error) {
      console.error("Error syncing with Google Calendar:", error);
      setError(
        error.message ||
          "Failed to sync with Google Calendar. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
          <CardDescription>Sync with your Google Calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isConnected ? (
              <div className="rounded-md border p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm">
                    Sync your StudySmart calendar with Google Calendar for
                    seamless integration.
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
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync with Google
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
                      Connected to Google Calendar
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Last synced: {lastSynced}
                    </p>
                  </div>
                </div>

                {calendars.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Synced Calendars:
                    </p>
                    <div className="space-y-2">
                      {calendars.map((calendar) => (
                        <div
                          key={calendar.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`calendar-${calendar.id}`}
                            checked={selectedCalendars.includes(calendar.id)}
                            onCheckedChange={() =>
                              handleCalendarToggle(calendar.id)
                            }
                          />
                          <Label
                            htmlFor={`calendar-${calendar.id}`}
                            className="text-sm text-green-800 dark:text-green-300"
                          >
                            {calendar.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40"
                    onClick={handleSync}
                    disabled={isLoading || selectedCalendars.length === 0}
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
            <DialogTitle>Connect to Google Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                To connect your Google Calendar, you'll need to authorize
                StudySmart AI to access your calendar data.
              </p>
              <p className="text-sm">
                Click the button below to authorize access. You'll be redirected
                to Google's authorization page.
              </p>
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
              onClick={handleAuthorize}
              disabled={isLoading}
            >
              {isLoading ? "Authorizing..." : "Authorize with Google"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
