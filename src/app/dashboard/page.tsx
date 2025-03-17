import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import {
  BarChart2,
  BookOpen,
  Calendar,
  Clock,
  ListTodo,
  Target,
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
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
    .order("due_date", { ascending: true })
    .limit(5);

  // Get user's study sessions
  const { data: studySessions } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false })
    .limit(5);

  // Get user's goals
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed", false)
    .order("deadline", { ascending: true })
    .limit(3);

  // Calculate total study time in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentSessions } = await supabase
    .from("study_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .gte("start_time", sevenDaysAgo.toISOString());

  const totalStudyMinutes =
    recentSessions?.reduce(
      (total, session) => total + (session.duration_minutes || 0),
      0,
    ) || 0;

  // Get upcoming tasks
  const { data: upcomingTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "todo")
    .order("due_date", { ascending: true })
    .limit(3);

  return (
    <DashboardShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingTasks?.length || 0} tasks due soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Study Time (7d)
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              {studySessions?.length || 0} recent sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Track your progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Your most urgent assignments and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks && upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between space-x-4 rounded-md border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.course || "No course"} · {task.priority} priority
                      </p>
                    </div>
                    <div className="text-sm">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "No due date"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No upcoming tasks
                  </p>
                  <Link
                    href="/dashboard/tasks"
                    className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
                  >
                    Add a task
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Study Sessions</CardTitle>
            <CardDescription>Your latest study activity</CardDescription>
          </CardHeader>
          <CardContent>
            {studySessions && studySessions.length > 0 ? (
              <div className="space-y-4">
                {studySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between space-x-4 rounded-md border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">
                        {session.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.duration_minutes} minutes
                      </p>
                    </div>
                    <div className="text-sm">
                      {new Date(session.start_time).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No study sessions recorded
                  </p>
                  <Link
                    href="/dashboard/focus"
                    className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
                  >
                    Start studying
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used tools and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/tasks">
                <div className="flex flex-col items-center justify-center rounded-md border p-4 hover:bg-accent hover:text-accent-foreground">
                  <ListTodo className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Add Task</span>
                </div>
              </Link>
              <Link href="/dashboard/focus">
                <div className="flex flex-col items-center justify-center rounded-md border p-4 hover:bg-accent hover:text-accent-foreground">
                  <Clock className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Focus Timer</span>
                </div>
              </Link>
              <Link href="/dashboard/calendar">
                <div className="flex flex-col items-center justify-center rounded-md border p-4 hover:bg-accent hover:text-accent-foreground">
                  <Calendar className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Calendar</span>
                </div>
              </Link>
              <Link href="/dashboard/notes">
                <div className="flex flex-col items-center justify-center rounded-md border p-4 hover:bg-accent hover:text-accent-foreground">
                  <BookOpen className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Notes</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
