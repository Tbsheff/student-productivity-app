import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Plus, Search, Tag } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import ClientNoteButton from "./components/client-note-button";
import ClientNoteCard from "./components/client-note-card";
import ClientCourseNoteItem from "./components/client-course-note-item";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's notes
  const { data: notes } = await supabase
    .from("notes")
    .select("*, courses(name, color)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Get user's courses for the dropdown
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // Extract unique tags from all notes
  const allTags =
    notes?.reduce<string[]>((tags, note) => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach((tag: string) => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
      return tags;
    }, []) || [];

  return (
    <DashboardShell title="Notes">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notes</h2>
          <p className="text-muted-foreground">
            Organize your study notes and materials
          </p>
        </div>
        <ClientNoteButton courses={courses || []} userId={user.id} />
      </div>

      <div className="mt-6 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="courses">By Course</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4 space-y-4">
          {notes && notes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <ClientNoteCard
                  key={note.id}
                  note={note}
                  courses={courses || []}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-2">
                  No notes yet. Create your first note to get started.
                </p>
                <ClientNoteButton courses={courses || []} userId={user.id} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-4 space-y-4">
          {notes && notes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.slice(0, 6).map((note) => (
                <ClientNoteCard
                  key={note.id}
                  note={note}
                  courses={courses || []}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">
                  No recent notes found.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="mt-4 space-y-4">
          {courses && courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const courseNotes =
                  notes?.filter((note) => note.course_id === course.id) || [];
                return (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: course.color || "#6366F1" }}
                        />
                        <CardTitle>{course.name}</CardTitle>
                      </div>
                      <CardDescription>
                        {courseNotes.length} note
                        {courseNotes.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {courseNotes.length > 0 ? (
                        <div className="space-y-2">
                          {courseNotes.slice(0, 3).map((note) => (
                            <ClientCourseNoteItem
                              key={note.id}
                              note={note}
                              courses={courses || []}
                            />
                          ))}
                          {courseNotes.length > 3 && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-indigo-600 w-full text-center"
                            >
                              View all {courseNotes.length} notes
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">
                          No notes for this course yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-2">
                  No courses found. Add a course to organize your notes.
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                >
                  Add a Course
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tags" className="mt-4 space-y-4">
          {allTags.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allTags.map((tagName) => {
                const tagNotes =
                  notes?.filter(
                    (note) => note.tags && note.tags.includes(tagName)
                  ) || [];
                return (
                  <Card key={tagName}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <CardTitle>{tagName}</CardTitle>
                      </div>
                      <CardDescription>
                        {tagNotes.length} note{tagNotes.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tagNotes.length > 0 && (
                        <div className="space-y-2">
                          {tagNotes.slice(0, 3).map((note) => (
                            <ClientCourseNoteItem
                              key={note.id}
                              note={note}
                              courses={courses || []}
                            />
                          ))}
                          {tagNotes.length > 3 && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-indigo-600 w-full text-center"
                            >
                              View all {tagNotes.length} notes
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Tag className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  No tags found. Add tags to your notes to organize them better.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
