import { redirect, notFound } from "next/navigation";
import { createClient } from "../../../../../supabase/server";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import dynamic from "next/dynamic";

// Dynamically import the NotePageEditor component
const NotePageEditor = dynamic(() => import("../components/note-page-editor"), {
  ssr: false,
});

export default async function EditNotePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the note
  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!note) {
    return notFound();
  }

  // Get user's courses for the dropdown
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // Get user's folders for the dropdown
  const { data: folders } = await supabase
    .from("note_folders")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return (
    <DashboardShell title={note.title}>
      <NotePageEditor
        noteId={note.id}
        courses={courses || []}
        folders={folders || []}
        userId={user.id}
        initialData={{
          title: note.title,
          content: note.content,
          course_id: note.course_id,
          folder_id: note.folder_id,
          tags: note.tags,
        }}
      />
    </DashboardShell>
  );
}
