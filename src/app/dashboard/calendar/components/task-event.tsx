"use client";

import { useState } from "react";
import TaskDetailsDialog from "../../tasks/components/task-details-dialog";
import { createClient } from "@/utils/supabase-client";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, GraduationCap } from "lucide-react";

interface TaskEventProps {
  task: {
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
    type?: "assignment" | "exam" | "announcement";
  };
  className?: string;
}

export default function TaskEvent({ task, className }: TaskEventProps) {
  const router = useRouter();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", task.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);

      if (error) throw error;
      setIsDetailsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Determine task type based on title or other properties
  const getTaskType = () => {
    const title = task.title?.toLowerCase() || "";
    if (
      title.includes("exam") ||
      title.includes("test") ||
      title.includes("quiz")
    ) {
      return "exam";
    } else if (
      title.includes("assignment") ||
      title.includes("project") ||
      task.priority === "high"
    ) {
      return "assignment";
    } else {
      return "announcement";
    }
  };

  // Get task type icon
  const getTaskTypeIcon = () => {
    const taskType = task.type || getTaskType();
    switch (taskType) {
      case "assignment":
        return <FileText className="h-3 w-3 mr-1 text-indigo-600" />;
      case "exam":
        return <GraduationCap className="h-3 w-3 mr-1 text-red-600" />;
      case "announcement":
        return <BookOpen className="h-3 w-3 mr-1 text-green-600" />;
      default:
        return null;
    }
  };

  // Get priority color
  const getPriorityColor = () => {
    const taskType = task.type || getTaskType();

    if (taskType === "exam") {
      return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800";
    } else if (taskType === "assignment") {
      return "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-800";
    } else {
      return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800";
    }
  };

  // Get status style
  const getStatusStyle = () => {
    switch (task.status) {
      case "completed":
        return "line-through opacity-70";
      default:
        return "";
    }
  };

  return (
    <>
      <div
        className={`text-xs p-1 rounded truncate cursor-pointer border ${getPriorityColor()} ${getStatusStyle()} ${className}`}
        onClick={() => setIsDetailsDialogOpen(true)}
        title={task.title}
      >
        <div className="flex items-center">
          {getTaskTypeIcon()}
          <span>{task.title}</span>
        </div>
      </div>

      <TaskDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        task={task}
        onEdit={() => {
          setIsDetailsDialogOpen(false);
          // Navigate to tasks page with this task open for editing
          router.push(`/dashboard/tasks?edit=${task.id}`);
        }}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
