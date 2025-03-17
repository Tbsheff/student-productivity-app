import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, BookOpen, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's study sessions
  const { data: studySessions } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false });

  // Calculate total study time by subject
  const subjectTotals: Record<string, number> = {};
  studySessions?.forEach((session) => {
    const subject = session.subject;
    const duration = session.duration_minutes || 0;
    subjectTotals[subject] = (subjectTotals[subject] || 0) + duration;
  });

  // Sort subjects by total time
  const sortedSubjects = Object.entries(subjectTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate daily study time for the last 7 days
  const dailyStudyTime: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    dailyStudyTime[dateString] = 0;
  }

  studySessions?.forEach((session) => {
    const date = new Date(session.start_time).toISOString().split("T")[0];
    if (dailyStudyTime[date] !== undefined) {
      dailyStudyTime[date] += session.duration_minutes || 0;
    }
  });

  return (
    <DashboardShell title="Study Analytics">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Study Analytics</h2>
        <p className="text-muted-foreground">
          Track your study habits and get insights to improve your productivity
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Study Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(
                (studySessions?.reduce(
                  (total, session) => total + (session.duration_minutes || 0),
                  0,
                ) || 0) / 60,
              )}
              h{" "}
              {(studySessions?.reduce(
                (total, session) => total + (session.duration_minutes || 0),
                0,
              ) || 0) % 60}
              m
            </div>
            <p className="text-xs text-muted-foreground">
              {studySessions?.length || 0} sessions recorded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Studied Subject
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedSubjects.length > 0 ? sortedSubjects[0][0] : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {sortedSubjects.length > 0
                ? `${Math.floor(sortedSubjects[0][1] / 60)}h ${sortedSubjects[0][1] % 60}m total`
                : "No data available"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Session Length
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studySessions && studySessions.length > 0
                ? Math.floor(
                    studySessions.reduce(
                      (total, session) =>
                        total + (session.duration_minutes || 0),
                      0,
                    ) / studySessions.length,
                  )
                : 0}{" "}
              min
            </div>
            <p className="text-xs text-muted-foreground">Per study session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productivity Score
            </CardTitle>
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

      <Tabs defaultValue="subjects" className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="subjects">
            <BookOpen className="mr-2 h-4 w-4" /> By Subject
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="mr-2 h-4 w-4" /> By Time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subject Breakdown</CardTitle>
                <CardDescription>
                  Time spent studying each subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedSubjects.length > 0 ? (
                    sortedSubjects.map(([subject, minutes], index) => {
                      const totalMinutes =
                        studySessions?.reduce(
                          (total, session) =>
                            total + (session.duration_minutes || 0),
                          0,
                        ) || 1; // Avoid division by zero
                      const percentage = Math.round(
                        (minutes / totalMinutes) * 100,
                      );

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium leading-none">
                                {subject}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {Math.floor(minutes / 60)}h {minutes % 60}m
                              </p>
                            </div>
                            <div className="text-sm font-medium">
                              {percentage}%
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-indigo-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          No study data available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions to improve your study habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h4 className="font-medium">Balance Your Study Time</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You're spending significantly more time on some subjects
                      than others. Consider allocating more time to your
                      less-studied subjects.
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <h4 className="font-medium">Optimal Study Sessions</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your most productive study sessions are around 45 minutes
                      long. Try to maintain this session length for maximum
                      efficiency.
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <h4 className="font-medium">Study Schedule</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on your patterns, you're most focused in the
                      morning. Schedule your most challenging subjects during
                      this time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Study Time</CardTitle>
                <CardDescription>
                  Hours studied per day over the last week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(dailyStudyTime).map(
                    ([date, minutes], index) => {
                      const percentage = Math.min(
                        Math.round((minutes / 240) * 100),
                        100,
                      ); // 4 hours as max
                      const dayName = new Date(date).toLocaleDateString(
                        "en-US",
                        { weekday: "short" },
                      );

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium leading-none">
                                {dayName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {Math.floor(minutes / 60)}h {minutes % 60}m
                              </p>
                            </div>
                            <div className="text-sm font-medium">
                              {Math.floor(minutes / 60)}h {minutes % 60}m
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-indigo-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Study Sessions</CardTitle>
                <CardDescription>
                  Your latest recorded study activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studySessions && studySessions.length > 0 ? (
                    studySessions.slice(0, 5).map((session) => (
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
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.start_time).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          No study sessions recorded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
