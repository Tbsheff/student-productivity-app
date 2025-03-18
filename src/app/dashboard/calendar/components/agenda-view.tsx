"use client";

import { Card, CardContent } from "@/components/ui/card";
import TaskEvent from "./task-event";

interface Task {
  id: string;
  title: string;
  description: string | null;
  course: string | null;
  due_date: string | null;
  priority: string | null;
  status: string | null;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
}

interface AgendaViewProps {
  tasks: Task[];
}

export default function AgendaView({ tasks }: AgendaViewProps) {
  // Group tasks by date
  const groupTasksByDate = () => {
    const grouped: Record<string, Task[]> = {};

    // Sort tasks by due date
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    // Group by date
    sortedTasks.forEach((task) => {
      if (!task.due_date) {
        // Group tasks with no due date
        if (!grouped["No Due Date"]) {
          grouped["No Due Date"] = [];
        }
        grouped["No Due Date"].push(task);
      } else {
        const date = new Date(task.due_date).toLocaleDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(task);
      }
    });

    return grouped;
  };

  const groupedTasks = groupTasksByDate();
  const dateGroups = Object.keys(groupedTasks);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (dateString === "No Due Date") return dateString;

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Check if a date is in the past
  const isDatePast = (dateString: string) => {
    if (dateString === "No Due Date") return false;

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {dateGroups.length > 0 ? (
            dateGroups.map((dateString) => (
              <div key={dateString} className="space-y-2">
                <h3
                  className={`text-md font-medium ${isDatePast(dateString) ? "text-red-600 dark:text-red-400" : ""}`}
                >
                  {formatDate(dateString)}
                  {isDatePast(dateString) &&
                    dateString !== "No Due Date" &&
                    " (Past Due)"}
                </h3>
                <div className="space-y-2">
                  {groupedTasks[dateString].map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between space-x-4 rounded-md border p-3"
                    >
                      <TaskEvent task={task} className="w-full text-sm p-2" />
                    </div>
                  ))}
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
  );
}
