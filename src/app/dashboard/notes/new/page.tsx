import { redirect } from "next/navigation";
import { createClient } from "../../../../../supabase/server";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import dynamic from "next/dynamic";

// Dynamically import the NotePageEditor component
const NotePageEditor = dynamic(() => import("../components/note-page-editor"), {
  ssr: false,
});

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: { folder?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
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

  // Pre-select folder if provided in query params
  const initialData = {
    folder_id: searchParams.folder || null,
  };

  return (
    <DashboardShell title="New Note">
      <NotePageEditor
        courses={courses || []}
        folders={folders || []}
        userId={user.id}
        initialData={initialData}
        onBack={() => redirect("/dashboard/notes")}
      />
    </DashboardShell>
  );
}
