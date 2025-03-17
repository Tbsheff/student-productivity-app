"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, RefreshCw, AlertCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase-client";

export default function IcsUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsSuccess(false);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError("");

    try {
      // Read the file content
      const fileContent = await readFileAsText(file);

      // Validate the ICS file format
      if (
        !fileContent.includes("BEGIN:VCALENDAR") ||
        !fileContent.includes("END:VCALENDAR")
      ) {
        throw new Error("Invalid ICS file format");
      }

      // Parse the ICS file
      const events = parseIcsData(fileContent);

      if (events.length === 0) {
        throw new Error("No events found in the ICS file");
      }

      // Store events in the database
      await storeEvents(events);

      setIsSuccess(true);
      setFile(null);

      // Reset the file input
      const fileInput = document.getElementById("ics-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Error uploading ICS file:", err);
      setError(
        err.message ||
          "Failed to import calendar. Please check the file format and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const parseIcsData = (icsData: string) => {
    // Enhanced ICS parsing logic
    const events = [];
    const lines = icsData.split(/\r\n|\n|\r/);
    let currentEvent = null;
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
            currentEvent.uid = `ics-import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          }
          events.push(currentEvent);
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
            currentEvent.start_time = formatIcsDate(
              line.substring(colonIndex + 1),
            );
          }
        } else if (line.startsWith("DTEND")) {
          const colonIndex = line.indexOf(":");
          if (colonIndex !== -1) {
            currentEvent.end_time = formatIcsDate(
              line.substring(colonIndex + 1),
            );
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

  const formatIcsDate = (icsDate: string) => {
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

  const storeEvents = async (events) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

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
            source: "ics_import",
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
            source: "ics_import",
            external_id: event.uid,
          },
          { onConflict: "external_id" },
        );
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Calendar</CardTitle>
        <CardDescription>Upload an ICS file to import events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm">
                Import events from an ICS file from other calendar applications.
              </p>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="ics-file">Upload ICS File</Label>
                <Input
                  id="ics-file"
                  type="file"
                  accept=".ics"
                  onChange={handleFileChange}
                />
              </div>
              {isSuccess && (
                <p className="text-sm text-green-600 mt-2">
                  Calendar imported successfully!
                </p>
              )}
              {error && (
                <div className="flex items-center text-red-600 text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
              <Button
                className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleUpload}
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" /> Import Calendar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
