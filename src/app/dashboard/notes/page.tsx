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

export default async function NotesPage() {
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
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
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
                <Card key={note.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">
                          {note.title}
                        </CardTitle>
                        {note.courses && (
                          <CardDescription>
                            <div className="flex items-center mt-1">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    note.courses.color || "#6366F1",
                                }}
                              />
                              {note.courses.name}
                            </div>
                          </CardDescription>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="line-clamp-3 text-sm text-muted-foreground">
                      {note.content || "No content"}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.map((tag: string, index: number) => (
                          <div
                            key={index}
                            className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-2">
                  No notes yet. Create your first note to get started.
                </p>
                <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="mr-2 h-4 w-4" /> New Note
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-4 space-y-4">
          {notes && notes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.slice(0, 6).map((note) => (
                <Card key={note.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">
                          {note.title}
                        </CardTitle>
                        {note.courses && (
                          <CardDescription>
                            <div className="flex items-center mt-1">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    note.courses.color || "#6366F1",
                                }}
                              />
                              {note.courses.name}
                            </div>
                          </CardDescription>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="line-clamp-3 text-sm text-muted-foreground">
                      {note.content || "No content"}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.map((tag: string, index: number) => (
                          <div
                            key={index}
                            className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                            <div
                              key={note.id}
                              className="p-2 rounded-md border hover:bg-accent cursor-pointer"
                            >
                              <div className="font-medium line-clamp-1">
                                {note.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(note.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                          {courseNotes.length > 3 && (
                            <Button
                              variant="link"
                              className="w-full text-indigo-600 hover:text-indigo-700 p-0 h-auto"
                            >
                              View all {courseNotes.length} notes
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            No notes for this course yet
                          </p>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-3 w-3" /> Add Note
                          </Button>
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
                <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-2">
                  No courses found. Add a course to organize your notes.
                </p>
                <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Course
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tags" className="mt-4 space-y-4">
          {allTags.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allTags.map((tag: string, index: number) => {
                const tagNotes =
                  notes?.filter(
                    (note) => note.tags && note.tags.includes(tag),
                  ) || [];
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <CardTitle>{tag}</CardTitle>
                      </div>
                      <CardDescription>
                        {tagNotes.length} note{tagNotes.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tagNotes.length > 0 && (
                        <div className="space-y-2">
                          {tagNotes.slice(0, 3).map((note) => (
                            <div
                              key={note.id}
                              className="p-2 rounded-md border hover:bg-accent cursor-pointer"
                            >
                              <div className="font-medium line-clamp-1">
                                {note.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(note.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                          {tagNotes.length > 3 && (
                            <Button
                              variant="link"
                              className="w-full text-indigo-600 hover:text-indigo-700 p-0 h-auto"
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
