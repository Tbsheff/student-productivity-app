"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Edit,
  Trash,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  };
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}

export default function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskDetailsDialogProps) {
  // Format dates for display
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No due date";

  const formattedDueTime = task.due_date
    ? new Date(task.due_date).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const formattedCreatedDate = new Date(task.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const formattedUpdatedDate = new Date(task.updated_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Determine if task is overdue
  const isOverdue =
    task.due_date &&
    task.status !== "completed" &&
    new Date(task.due_date) < new Date();

  // Get priority badge color
  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Get status badge color
  const getStatusColor = () => {
    switch (task.status) {
      case "todo":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "in_progress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Get status actions based on current status
  const getStatusActions = () => {
    switch (task.status) {
      case "todo":
        return [
          {
            label: "Start Working",
            status: "in_progress",
            icon: <ArrowRight className="h-4 w-4 mr-2" />,
          },
          {
            label: "Mark as Completed",
            status: "completed",
            icon: <CheckCircle className="h-4 w-4 mr-2" />,
          },
        ];
      case "in_progress":
        return [
          {
            label: "Move to To Do",
            status: "todo",
            icon: <ArrowRight className="h-4 w-4 mr-2" />,
          },
          {
            label: "Mark as Completed",
            status: "completed",
            icon: <CheckCircle className="h-4 w-4 mr-2" />,
          },
        ];
      case "completed":
        return [
          {
            label: "Move to To Do",
            status: "todo",
            icon: <ArrowRight className="h-4 w-4 mr-2" />,
          },
          {
            label: "Move to In Progress",
            status: "in_progress",
            icon: <ArrowRight className="h-4 w-4 mr-2" />,
          },
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor()}>
              {task.status === "todo"
                ? "To Do"
                : task.status === "in_progress"
                  ? "In Progress"
                  : task.status === "completed"
                    ? "Completed"
                    : task.status}
            </Badge>
            <Badge className={getPriorityColor()}>
              {task.priority
                ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                : "Medium"}{" "}
              Priority
            </Badge>
            {task.course && <Badge variant="outline">{task.course}</Badge>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Due Date</h3>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span
                className={isOverdue ? "text-red-600 dark:text-red-400" : ""}
              >
                {formattedDueDate}
                {formattedDueTime && <span> at {formattedDueTime}</span>}
                {isOverdue && <span> (Overdue)</span>}
              </span>
            </div>
          </div>

          {/* Estimated Time */}
          {task.estimated_minutes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Estimated Time</h3>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{task.estimated_minutes} minutes</span>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Task Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Created: {formattedCreatedDate}</div>
              <div>Last Updated: {formattedUpdatedDate}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            {getStatusActions().map((action) => (
              <Button
                key={action.status}
                variant="outline"
                size="sm"
                onClick={() => {
                  onStatusChange(action.status);
                  onOpenChange(false);
                }}
              >
                {action.icon} {action.label}
              </Button>
            ))}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="sm"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
