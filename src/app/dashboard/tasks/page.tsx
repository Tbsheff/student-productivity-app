import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import TaskList from "./components/task-list";
import { Suspense } from "react";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  // Group tasks by status
  const todoTasks = tasks?.filter((task) => task.status === "todo") || [];
  const inProgressTasks =
    tasks?.filter((task) => task.status === "in_progress") || [];
  const completedTasks =
    tasks?.filter((task) => task.status === "completed") || [];

  return (
    <DashboardShell title="Task Management">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">
          Manage your assignments, projects, and to-dos
        </p>
      </div>

      <Tabs defaultValue="todo" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todo">
          <Suspense fallback={<div>Loading...</div>}>
            <TaskList tasks={todoTasks} status="todo" title="To Do" />
          </Suspense>
        </TabsContent>

        <TabsContent value="in-progress">
          <Suspense fallback={<div>Loading...</div>}>
            <TaskList
              tasks={inProgressTasks}
              status="in_progress"
              title="In Progress"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="completed">
          <Suspense fallback={<div>Loading...</div>}>
            <TaskList
              tasks={completedTasks}
              status="completed"
              title="Completed"
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
