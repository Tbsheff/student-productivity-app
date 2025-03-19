import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return children;
}
