import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import React from "react";
import dynamic from "next/dynamic";
import CalendarView from "./components/calendar-view";
import AgendaView from "./components/agenda-view";

// Dynamically import components with client-side rendering
const CourseCalendarView = dynamic(
  () => import("./components/course-calendar-view"),
  { ssr: false },
);

const CanvasIntegration = dynamic(
  () => import("../calendar/components/canvas-integration"),
  { ssr: false },
);

const GoogleCalendarSync = dynamic(
  () => import("../calendar/components/google-calendar-sync"),
  { ssr: false },
);

const IcsUpload = dynamic(() => import("../calendar/components/ics-upload"), {
  ssr: false,
});

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's tasks with due dates
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true });

  return (
    <DashboardShell title="Calendar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Manage your schedule, deadlines, and events
          </p>
        </div>
      </div>

      <Tabs defaultValue="month" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <CalendarView tasks={tasks || []} />
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <CalendarView tasks={tasks || []} view="week" />
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <CalendarView tasks={tasks || []} view="day" />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <CourseCalendarView tasks={tasks || []} />
        </TabsContent>

        <TabsContent value="agenda" className="space-y-4">
          <AgendaView tasks={tasks || []} />
        </TabsContent>
      </Tabs>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CanvasIntegration />
        </div>

        <div className="lg:col-span-1">
          <GoogleCalendarSync />
        </div>

        <div className="lg:col-span-1">
          <IcsUpload />
        </div>
      </div>
    </DashboardShell>
  );
}
