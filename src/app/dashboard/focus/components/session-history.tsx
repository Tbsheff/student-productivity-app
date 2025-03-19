"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase-client";
import { Clock } from "lucide-react";

interface StudySession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  subject: string;
  notes: string | null;
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("study_sessions")
          .select("*")
          .order("start_time", { ascending: false })
          .limit(10);

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error("Error fetching study sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if date is today or yesterday
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No sessions recorded yet</p>
        <p className="text-xs text-muted-foreground">
          Complete a focus session to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center justify-between space-x-4 rounded-md border p-3"
        >
          <div className="space-y-1">
            <p className="font-medium leading-none">{session.subject}</p>
            <p className="text-sm text-muted-foreground">
              {session.duration_minutes} minutes
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(session.start_time)}
          </div>
        </div>
      ))}
    </div>
  );
}
