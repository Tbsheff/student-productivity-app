import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileUp,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import components with client-side rendering
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

  // Current date for the calendar
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  // Generate days for the current month
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ).getDay();

  // Calculate days from previous month to show
  const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Generate calendar days array
  const calendarDays = [];

  // Add days from previous month
  const prevMonthDays = new Date(
    today.getFullYear(),
    today.getMonth(),
    0,
  ).getDate();
  for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(today.getFullYear(), today.getMonth() - 1, i),
    });
  }

  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(today.getFullYear(), today.getMonth(), i),
    });
  }

  // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(today.getFullYear(), today.getMonth() + 1, i),
    });
  }

  // Group calendar days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <DashboardShell title="Calendar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Manage your schedule, deadlines, and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" placeholder="Enter event title" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter event description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course">Course (Optional)</Label>
                  <Input id="course" placeholder="Associate with a course" />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                  Save Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="month" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-[400px] grid-cols-4">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium">
                {currentMonth} {currentYear}
              </div>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Today
            </Button>
          </div>
        </div>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 text-center text-sm font-medium"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>
              <div className="grid grid-cols-7 grid-rows-6 h-[600px]">
                {weeks.map((week, weekIndex) => (
                  <React.Fragment key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      // Check if there are tasks due on this day
                      const dayTasks =
                        tasks?.filter((task) => {
                          const taskDate = new Date(task.due_date);
                          return (
                            taskDate.getDate() === day.date.getDate() &&
                            taskDate.getMonth() === day.date.getMonth() &&
                            taskDate.getFullYear() === day.date.getFullYear()
                          );
                        }) || [];

                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`border p-1 ${day.isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground"} ${day.date.getDate() === today.getDate() && day.date.getMonth() === today.getMonth() ? "bg-indigo-50 dark:bg-indigo-950/20" : ""}`}
                        >
                          <div className="flex justify-between items-start">
                            <span
                              className={`text-sm ${day.date.getDate() === today.getDate() && day.date.getMonth() === today.getMonth() ? "font-bold text-indigo-600" : ""}`}
                            >
                              {day.day}
                            </span>
                            {dayTasks.length > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
                                {dayTasks.length}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                            {dayTasks.map((task) => (
                              <div
                                key={task.id}
                                className="text-xs p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded truncate"
                              >
                                {task.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">
                  Weekly view will be implemented soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">
                  Daily view will be implemented soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between space-x-4 rounded-md border p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.course || "No course"} · {task.priority}{" "}
                          priority
                        </p>
                      </div>
                      <div className="text-sm">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No due date"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        No upcoming events
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
