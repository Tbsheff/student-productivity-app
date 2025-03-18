"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Edit,
  MoreVertical,
  Trash,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import TaskForm from "./task-form";
import TaskDetailsDialog from "./task-details-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
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
}

export default function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);

      if (error) throw error;
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Format due date for display
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No due date";

  // Format due time for display if available
  const formattedDueTime = task.due_date
    ? new Date(task.due_date).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Determine if task is overdue
  const isOverdue =
    task.due_date &&
    task.status !== "completed" &&
    new Date(task.due_date) < new Date();

  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-amber-600 dark:text-amber-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-muted-foreground";
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
    <>
      <Card className={isOverdue ? "border-red-300 dark:border-red-800" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div
              className="cursor-pointer"
              onClick={() => setIsDetailsDialogOpen(true)}
            >
              <CardTitle className="line-clamp-1">{task.title}</CardTitle>
              <CardDescription>
                {task.course || "No course"} ·{" "}
                <span className={getPriorityColor()}>
                  {task.priority || "medium"} priority
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center">
              <div className="text-sm text-muted-foreground mr-2">
                {isOverdue ? (
                  <span className="text-red-600 dark:text-red-400">
                    Overdue: {formattedDueDate}
                  </span>
                ) : (
                  <span>
                    {formattedDueDate}
                    {formattedDueTime && <span> at {formattedDueTime}</span>}
                  </span>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsDetailsDialogOpen(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {getStatusActions().map((action) => (
                    <DropdownMenuItem
                      key={action.status}
                      onClick={() => handleStatusChange(action.status)}
                      disabled={isUpdating}
                    >
                      {action.icon} {action.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash className="h-4 w-4 mr-2" /> Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="text-sm line-clamp-2 cursor-pointer"
            onClick={() => setIsDetailsDialogOpen(true)}
          >
            {task.description || "No description"}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <div className="flex items-center text-sm text-muted-foreground">
            {task.estimated_minutes ? (
              <>
                <Clock className="h-3.5 w-3.5 mr-1" />
                {task.estimated_minutes} min
              </>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            {task.status === "todo" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("in_progress")}
                disabled={isUpdating}
              >
                Start
              </Button>
            )}
            {task.status === "in_progress" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("completed")}
                disabled={isUpdating}
              >
                Complete
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Edit Task Dialog */}
      <TaskForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        taskId={task.id}
        defaultValues={{
          title: task.title,
          description: task.description || "",
          course: task.course || "",
          due_date: task.due_date || "",
          priority: task.priority || "medium",
          status: task.status || "todo",
          estimated_minutes: task.estimated_minutes || undefined,
        }}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        task={task}
        onEdit={() => {
          setIsDetailsDialogOpen(false);
          setIsEditDialogOpen(true);
        }}
        onDelete={() => {
          setIsDetailsDialogOpen(false);
          setIsDeleteDialogOpen(true);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
