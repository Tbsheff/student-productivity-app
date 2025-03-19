"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Tag, X, Save } from "lucide-react";
import { DynamicBlocknoteEditor } from "./dynamic-editor";
import { createClient } from "@/utils/supabase-client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface Course {
  id: string;
  name: string;
  color: string;
}

interface Folder {
  id: string;
  name: string;
}

interface NotePageEditorProps {
  noteId?: string;
  courses: Course[];
  folders: Folder[];
  userId: string;
  initialData?: {
    title?: string;
    content?: string;
    course_id?: string | null;
    folder_id?: string | null;
    tags?: string[] | null;
  };
}

export default function NotePageEditor({
  noteId,
  courses,
  folders,
  userId,
  initialData = {},
}: NotePageEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [courseId, setCourseId] = useState(initialData.course_id || "");
  const [folderId, setFolderId] = useState(initialData.folder_id || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Mark as dirty when any content changes
    if (title || content || courseId || folderId || tags.length > 0) {
      setIsDirty(true);
    }

    // Auto-save logic
    if (!autoSaveEnabled || !isDirty || !noteId) return;

    const saveTimeout = setTimeout(() => {
      handleSave(true);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(saveTimeout);
  }, [
    title,
    content,
    courseId,
    folderId,
    tags,
    autoSaveEnabled,
    isDirty,
    noteId,
  ]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle content change from the BlockNote editor
  const handleEditorContentChange = useCallback((contentJson: string) => {
    setContent(contentJson);
  }, []);

  const handleBack = () => {
    router.push("/dashboard/notes");
  };

  const handleSave = async (isAutoSave = false) => {
    if (!title.trim()) {
      if (!isAutoSave) {
        toast({
          title: "Title is required",
          description: "Please enter a title for your note",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      if (!isAutoSave) setIsLoading(true);
      const supabase = createClient();

      const noteData = {
        title,
        content,
        course_id: courseId || null,
        folder_id: folderId || null,
        tags: tags.length > 0 ? tags : null,
        updated_at: new Date().toISOString(),
      };

      if (noteId) {
        // Update existing note
        const { error } = await supabase
          .from("notes")
          .update(noteData)
          .eq("id", noteId);

        if (error) throw error;

        setLastSaved(new Date());
        setIsDirty(false);

        if (!isAutoSave) {
          toast({
            title: "Note updated",
            description: "Your note has been updated successfully",
          });
        }
      } else {
        // Create new note
        const { data, error } = await supabase
          .from("notes")
          .insert({
            ...noteData,
            user_id: userId,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;

        if (!isAutoSave) {
          toast({
            title: "Note created",
            description: "Your note has been created successfully",
          });
          // Navigate to the edit page for the new note
          router.push(`/dashboard/notes?edit=${data[0].id}`);
        }
      }

      if (!isAutoSave) {
        // Only refresh and navigate back on manual save
        router.refresh();
        handleBack();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      if (!isAutoSave) {
        toast({
          title: "Error",
          description: "There was an error saving your note",
          variant: "destructive",
        });
      }
    } finally {
      if (!isAutoSave) setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-xl font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={() => handleSave()}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="flex-grow">
            <div className="h-[calc(100vh-250px)] overflow-hidden border rounded-md">
              <DynamicBlocknoteEditor
                initialContent={content}
                noteId={noteId}
                onChange={handleEditorContentChange}
              />
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select
              value={folderId || "none"}
              onValueChange={(value) =>
                setFolderId(value === "none" ? "" : value)
              }
            >
              <SelectTrigger id="folder">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={courseId || "none"}
              onValueChange={(value) =>
                setCourseId(value === "none" ? "" : value)
              }
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

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Auto-save</Label>
              <input
                type="checkbox"
                id="auto-save"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, your note will be automatically saved after 3
              seconds of inactivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
