import { Suspense } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import dynamic from "next/dynamic";

// Import the client component
const NotesPageClient = dynamic(
  () => import("./components/notes-page-client"),
  { ssr: false },
);

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

  // Get user's folders
  const { data: folders } = await supabase
    .from("note_folders")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return (
    <DashboardShell title="Notes">
      <Suspense fallback={<div>Loading...</div>}>
        <NotesPageClient
          notes={notes || []}
          courses={courses || []}
          folders={folders || []}
          userId={user.id}
        />
      </Suspense>
    </DashboardShell>
  );
}
