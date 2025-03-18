"use client";

import { useState } from "react";
import TaskEvent from "./task-event";
import { Plus } from "lucide-react";
import TaskForm from "../../tasks/components/task-form";

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

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export default function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  tasks,
}: CalendarDayProps) {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Format date for the task form
  const formattedDate = date.toISOString().split("T")[0];

  return (
    <div
      className={`border p-1 relative min-h-[100px] ${isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground"} ${isToday ? "bg-indigo-50 dark:bg-indigo-950/20" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <span
          className={`text-sm ${isToday ? "font-bold text-indigo-600" : ""}`}
        >
          {date.getDate()}
        </span>
        {tasks.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
            {tasks.length}
          </span>
        )}
      </div>

      <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
        {tasks.map((task) => (
          <TaskEvent key={task.id} task={task} />
        ))}
      </div>

      {/* Add task button (visible on hover) */}
      {isHovered && isCurrentMonth && (
        <button
          className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
          onClick={() => setIsAddTaskDialogOpen(true)}
          title="Add task for this day"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}

      {/* Task form dialog */}
      <TaskForm
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        defaultValues={{
          due_date: formattedDate,
        }}
      />
    </div>
  );
}
