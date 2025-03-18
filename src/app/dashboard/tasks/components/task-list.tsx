"use client";

import { useState, useEffect } from "react";
import TaskCard from "./task-card";
import TaskFilter from "./task-filter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskForm from "./task-form";
import { Card, CardContent } from "@/components/ui/card";

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

interface TaskListProps {
  tasks: Task[];
  status: string;
  title: string;
}

export default function TaskList({ tasks, status, title }: TaskListProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);

  // Extract unique courses from tasks
  useEffect(() => {
    const courses = tasks
      .map((task) => task.course)
      .filter((course): course is string => !!course);
    setUniqueCourses([...new Set(courses)]);
  }, [tasks]);

  // Apply filters to tasks
  const handleFilterChange = (filters: {
    search: string;
    priority: string[];
    course: string[];
    sortBy: string;
    sortDirection: "asc" | "desc";
  }) => {
    let filtered = [...tasks];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description?.toLowerCase().includes(searchLower) ?? false) ||
          (task.course?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(
        (task) => task.priority && filters.priority.includes(task.priority),
      );
    }

    // Apply course filter
    if (filters.course.length > 0) {
      filtered = filtered.filter(
        (task) => task.course && filters.course.includes(task.course),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (filters.sortBy) {
        case "due_date":
          valueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          valueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          break;
        case "priority":
          const priorityOrder: Record<string, number> = {
            high: 1,
            medium: 2,
            low: 3,
          };
          valueA = priorityOrder[a.priority || "medium"] || 2;
          valueB = priorityOrder[b.priority || "medium"] || 2;
          break;
        case "title":
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case "created_at":
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
          break;
        default:
          valueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          valueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      }

      // Apply sort direction
      return filters.sortDirection === "asc"
        ? valueA > valueB
          ? 1
          : -1
        : valueA < valueB
          ? 1
          : -1;
    });

    setFilteredTasks(filtered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {title} ({filteredTasks.length})
        </h3>
        <Button
          onClick={() => setIsAddTaskDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <TaskFilter onFilterChange={handleFilterChange} courses={uniqueCourses} />

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">
                No {status.replace("_", " ")} tasks found.
              </p>
              <Button
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsAddTaskDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <TaskForm
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        defaultValues={{ status }}
      />
    </div>
  );
}
