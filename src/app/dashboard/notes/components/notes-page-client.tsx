"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, Search, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase-client";
import ClientNoteButton from "./client-note-button";
import ClientNoteCard from "./client-note-card";
import ClientCourseNoteItem from "./client-course-note-item";
import FolderSidebar from "./folder-sidebar";
import dynamic from "next/dynamic";

// Dynamically import the NotePageEditor component directly
const NotePageEditor = dynamic(() => import("./note-page-editor"), {
  ssr: false,
});

export default function NotesPageClient({
  notes,
  courses,
  folders,
  userId,
}: {
  notes: any[];
  courses: any[];
  folders: any[];
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editNoteId = searchParams.get("edit");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [editingNote, setEditingNote] = useState<any | null>(null);

  // Filter notes based on search query and selected folder
  useEffect(() => {
    let filtered = [...notes];

    // Filter by folder
    if (selectedFolderId) {
      filtered = filtered.filter((note) => note.folder_id === selectedFolderId);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          (note.content && note.content.toLowerCase().includes(query)),
      );
    }

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedFolderId]);

  // Fetch note details when in edit mode
  useEffect(() => {
    if (editNoteId) {
      const fetchNote = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("notes")
          .select("*")
          .eq("id", editNoteId)
          .single();

        if (data) {
          setEditingNote(data);
        }
      };

      fetchNote();
    } else {
      setEditingNote(null);
    }
  }, [editNoteId]);

  // Extract unique tags from all notes
  const allTags = notes.reduce<string[]>((tags, note) => {
    if (note.tags && Array.isArray(note.tags)) {
      note.tags.forEach((tag: string) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, []);

  // Handle folder selection
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  // Handle back from edit
  const handleBackFromEdit = () => {
    router.push("/dashboard/notes");
  };

  // If in edit mode, show the note editor
  if (editNoteId && editingNote) {
    return (
      <NotePageEditor
        noteId={editNoteId}
        courses={courses}
        folders={folders}
        userId={userId}
        initialData={{
          title: editingNote.title,
          content: editingNote.content,
          course_id: editingNote.course_id,
          folder_id: editingNote.folder_id,
          tags: editingNote.tags,
        }}
        onBack={handleBackFromEdit}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Folder sidebar */}
      <div className="w-64 h-full">
        <FolderSidebar
          userId={userId}
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Notes</h2>
            <p className="text-muted-foreground">
              {selectedFolderId
                ? `Viewing folder: ${folders.find((f) => f.id === selectedFolderId)?.name || ""}`
                : "All notes"}
            </p>
          </div>
          <ClientNoteButton selectedFolderId={selectedFolderId} />
        </div>

        <div className="mb-6 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <ClientNoteCard key={note.id} note={note} courses={courses} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileText className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-2">
                {searchQuery
                  ? "No notes match your search."
                  : selectedFolderId
                    ? "No notes in this folder yet."
                    : "No notes yet. Create your first note to get started."}
              </p>
              <ClientNoteButton selectedFolderId={selectedFolderId} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
