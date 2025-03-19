"use client";

import { useState, useEffect, useCallback } from "react";
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
import { DynamicBlocknoteEditor } from "./dynamic-editor";
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
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NoteDetailProps {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses?: Array<{ id: string; name: string; color: string }>;
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
  courses = [],
}: NoteDetailProps) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (open && noteId) {
      fetchNote();
    }
  }, [open, noteId]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setCourseId(note.course_id);
    }
  }, [note]);

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
      toast({
        title: "Error",
        description: "Failed to load the note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = useCallback((content: string) => {
    setEditedContent(content);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please provide a title for the note.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const supabase = createClient();

      const updates = {
        title,
        course_id: courseId,
        content: editedContent || note?.content || "",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", noteId);

      if (error) throw error;

      if (note) {
        setNote({
          ...note,
          ...updates
        });
      }

      setIsEditing(false);

      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update the note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      onOpenChange(false);

      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });

      router.refresh();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete the note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] h-[80vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            {isEditing ? (
              <div className="w-full">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold"
                  placeholder="Note title"
                />
              </div>
            ) : (
              <DialogTitle className="mr-auto">{note?.title}</DialogTitle>
            )}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="px-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700 px-2"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="px-2"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    variant="destructive"
                    className="px-2"
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </>
              )}
            </div>
          </DialogHeader>

          {isEditing && (
            <div className="my-4">
              <Label htmlFor="course">Course</Label>
              <Select
                value={courseId || "none"}
                onValueChange={(value) => setCourseId(value === "none" ? null : value)}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex items-center">
                        {course.color && (
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: course.color }}
                          />
                        )}
                        <span>{course.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isEditing && note?.courses && (
            <div className="flex items-center mb-4 text-sm text-muted-foreground">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: note.courses.color || "#6366F1" }}
              />
              <span>{note.courses.name}</span>
              <span className="mx-2">•</span>
              <span>
                Last updated: {new Date(note.updated_at).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex-1 overflow-auto h-[calc(80vh-180px)]">
            <DynamicBlocknoteEditor
              initialContent={note?.content}
              noteId={isEditing ? noteId : undefined}
              onChange={handleContentChange}
              readOnly={!isEditing}
            />
          </div>

          {note?.tags && note.tags.length > 0 && !isEditing && (
            <div className="flex flex-wrap gap-1 mt-4">
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

