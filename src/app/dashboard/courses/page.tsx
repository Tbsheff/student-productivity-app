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
import {
  ArrowUpRight,
  BookOpen,
  Edit,
  FileText,
  ListTodo,
  Plus,
  Trash,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function CoursesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // Get tasks count for each course
  const { data: tasks } = await supabase
    .from("tasks")
    .select("course, id")
    .eq("user_id", user.id);

  // Get notes count for each course
  const { data: notes } = await supabase
    .from("notes")
    .select("course_id, id")
    .eq("user_id", user.id);

  // Calculate tasks and notes count for each course
  const courseStats =
    courses?.map((course) => {
      const courseTasks =
        tasks?.filter((task) => task.course === course.name) || [];
      const courseNotes =
        notes?.filter((note) => note.course_id === course.id) || [];
      return {
        ...course,
        tasksCount: courseTasks.length,
        notesCount: courseNotes.length,
      };
    }) || [];

  // Default course colors
  const defaultColors = [
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#F43F5E", // Rose
    "#EF4444", // Red
    "#F97316", // Orange
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
  ];

  return (
    <DashboardShell title="Courses">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Manage your courses, assignments, and study materials
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Course Name</Label>
                <Input id="name" placeholder="Enter course name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter course description"
                />
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultColors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-400"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                Save Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        {courseStats && courseStats.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courseStats.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: course.color || defaultColors[0] }}
                />
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>
                    {course.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <ListTodo className="h-4 w-4 text-indigo-600" />
                        <span>{course.tasksCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tasks
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <span>{course.notesCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Notes
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ListTodo className="h-4 w-4 mr-2" /> Tasks
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" /> Notes
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-2">
                No courses yet. Add your first course to get started.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Course Name</Label>
                      <Input id="name" placeholder="Enter course name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="Enter course description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {defaultColors.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-400"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                      Save Course
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Canvas Integration</CardTitle>
            <CardDescription>
              Import your Canvas courses and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm">
                    Connect your Canvas account to import courses, assignments,
                    and deadlines automatically.
                  </p>
                  <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Connect Canvas
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
