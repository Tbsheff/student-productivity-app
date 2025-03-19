"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientNoteButtonProps {
  selectedFolderId: string | null;
}

export default function ClientNoteButton({
  selectedFolderId,
}: ClientNoteButtonProps) {
  const router = useRouter();

  const handleCreateNote = () => {
    // Navigate to the new note page with the selected folder as a query parameter
    const queryParams = selectedFolderId ? `?folder=${selectedFolderId}` : "";
    router.push(`/dashboard/notes/new${queryParams}`);
  };

  return (
    <Button
      className="bg-indigo-600 hover:bg-indigo-700"
      onClick={handleCreateNote}
    >
      <Plus className="mr-2 h-4 w-4" /> New Note
    </Button>
  );
}
