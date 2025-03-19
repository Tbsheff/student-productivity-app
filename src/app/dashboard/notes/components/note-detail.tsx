"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase-client";
import { useRouter } from "next/navigation";
import { Edit, Trash, Tag, ArrowLeft } from "lucide-react";
import BlocknoteEditor from "./blocknote-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NoteDetailProps {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  course_id: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  courses?: {
    name: string;
    color: string;
  };
}

export default function NoteDetail({
  noteId,
  open,
  onOpenChange,
}: NoteDetailProps) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (open && noteId) {
      fetchNote();
    }
  }, [open, noteId]);

  const fetchNote = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("notes")
        .select("*, courses(name, color)")
        .eq("id", noteId)
        .single();

      if (error) throw error;
      setNote(data);
    } catch (error) {
      console.error("Error fetching note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) throw error;
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <DialogTitle className="text-xl">
                {isLoading ? "Loading..." : note?.title}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center flex-grow">
              <p>Loading note...</p>
            </div>
          ) : (
            <div className="flex flex-col flex-grow overflow-hidden">
              {/* Note metadata */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {note?.courses && (
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-1"
                        style={{
                          backgroundColor: note.courses.color || "#6366F1",
                        }}
                      />
                      <span className="text-sm">{note.courses.name}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {note && formatDate(note.updated_at)}
                </div>
              </div>

              {/* Tags */}
              {note?.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {note.tags.map((tag, index) => (
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

              {/* Note content */}
              <div className="flex-grow overflow-hidden">
                <BlocknoteEditor
                  initialContent={note?.content}
                  noteId={noteId}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isEditing && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsEditing(false)}
              >
                Done Editing
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
