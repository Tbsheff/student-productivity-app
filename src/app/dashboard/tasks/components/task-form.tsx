"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  name: string;
  color: string;
}

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    course?: string;
    due_date?: string;
    priority?: string;
    status?: string;
    estimated_minutes?: number;
  };
}

export default function TaskForm({
  open,
  onOpenChange,
  taskId,
  defaultValues = {},
}: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultValues.title || "");
  const [description, setDescription] = useState(
    defaultValues.description || "",
  );
  const [course, setCourse] = useState(defaultValues.course || "");
  const [dueDate, setDueDate] = useState(
    defaultValues.due_date
      ? new Date(defaultValues.due_date).toISOString().split("T")[0]
      : "",
  );
  const [dueTime, setDueTime] = useState(
    defaultValues.due_date
      ? new Date(defaultValues.due_date)
          .toTimeString()
          .split(" ")[0]
          .substring(0, 5)
      : "",
  );
  const [priority, setPriority] = useState(defaultValues.priority || "medium");
  const [status, setStatus] = useState(defaultValues.status || "todo");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    defaultValues.estimated_minutes?.toString() || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch courses when the dialog opens
  useEffect(() => {
    if (open) {
      const fetchCourses = async () => {
        try {
          setIsLoading(true);
          const supabase = createClient();
          const { data, error } = await supabase.from("courses").select("*");
          
          if (error) {
            throw error;
          }
          
          if (data) {
            setCourses(data);
          }
        } catch (err) {
          console.error("Error fetching courses:", err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCourses();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!title) {
        throw new Error("Title is required");
      }

      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Combine date and time if both are provided
      let dueDateISO = null;
      if (dueDate) {
        if (dueTime) {
          dueDateISO = new Date(`${dueDate}T${dueTime}:00`).toISOString();
        } else {
          dueDateISO = new Date(`${dueDate}T00:00:00`).toISOString();
        }
      }

      const taskData = {
        title,
        description,
        course: course || null, // Ensure null if empty string
        due_date: dueDateISO,
        priority,
        status,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        user_id: userData.user.id,
      };

      if (taskId) {
        // Update existing task
        const { error: updateError } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", taskId);

        if (updateError) throw updateError;
      } else {
        // Create new task
        const { error: insertError } = await supabase
          .from("tasks")
          .insert(taskData);

        if (insertError) throw insertError;
      }

      // Reset form and close dialog
      setTitle("");
      setDescription("");
      setCourse("");
      setDueDate("");
      setDueTime("");
      setPriority("medium");
      setStatus("todo");
      setEstimatedMinutes("");
      onOpenChange(false);

      // Refresh the page to show the updated data
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if the course ID exists in the courses array
  const courseExists = course ? courses.some(c => c.id === course) : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{taskId ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Select 
                  value={courseExists ? course : "none"} 
                  onValueChange={(val) => setCourse(val === "none" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {course && !courseExists && !isLoading && (
                  <p className="text-xs text-amber-500 mt-1">
                    The previously selected course no longer exists
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date (Optional)</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-time">Due Time (Optional)</Label>
                <Input
                  id="due-time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-minutes">
                  Estimated Time (minutes, Optional)
                </Label>
                <Input
                  id="estimated-minutes"
                  type="number"
                  min="0"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm font-medium text-red-500">{error}</div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : taskId ? "Update Task" : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
