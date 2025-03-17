import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Edit, Plus, Target, Trash } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function GoalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's goals
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("deadline", { ascending: true });

  // Separate goals by status
  const activeGoals = goals?.filter((goal) => !goal.completed) || [];
  const completedGoals = goals?.filter((goal) => goal.completed) || [];

  // Calculate days remaining for each goal
  const goalsWithDaysRemaining = activeGoals.map((goal) => {
    let daysRemaining = null;
    if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return {
      ...goal,
      daysRemaining,
    };
  });

  return (
    <DashboardShell title="Goals">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
          <p className="text-muted-foreground">
            Track your academic and study goals
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="Enter goal title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" placeholder="Enter goal description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target">Target Value</Label>
                  <Input id="target" type="number" placeholder="100" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" placeholder="hours, pages, etc." />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input id="deadline" type="date" />
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                Save Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Active Goals</h3>
        {goalsWithDaysRemaining.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goalsWithDaysRemaining.map((goal) => {
              // Calculate progress percentage
              const progress =
                goal.current_value && goal.target_value
                  ? Math.min(
                      Math.round(
                        (goal.current_value / goal.target_value) * 100,
                      ),
                      100,
                    )
                  : 0;

              return (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{goal.title}</CardTitle>
                      {goal.daysRemaining !== null && (
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${goal.daysRemaining <= 3 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"}`}
                        >
                          {goal.daysRemaining <= 0
                            ? "Overdue"
                            : `${goal.daysRemaining} day${goal.daysRemaining !== 1 ? "s" : ""} left`}
                        </div>
                      )}
                    </div>
                    <CardDescription>
                      {goal.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">
                          {goal.current_value || 0} / {goal.target_value || 0}{" "}
                          {goal.unit || ""}
                        </div>
                        <div className="text-sm font-medium">{progress}%</div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {goal.deadline && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Due by {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-2" /> Update Progress
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Complete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Target className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-2">
                No active goals. Set a goal to track your progress.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Goal</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Goal Title</Label>
                      <Input id="title" placeholder="Enter goal title" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="Enter goal description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="target">Target Value</Label>
                        <Input id="target" type="number" placeholder="100" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" placeholder="hours, pages, etc." />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deadline">Deadline (Optional)</Label>
                      <Input id="deadline" type="date" />
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                      Save Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>

      {completedGoals.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-4">Completed Goals</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                      {goal.title}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      Completed on{" "}
                      {new Date(goal.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <CardDescription>
                    {goal.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {goal.target_value || 0} {goal.unit || ""} achieved
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
