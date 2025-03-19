"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase-client";
import { useRouter } from "next/navigation";
import BlocknoteEditor from "./blocknote-editor";

interface Course {
  id: string;
  name: string;
  color: string;
}

interface NoteEditorProps {
  courses: Course[];
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultValues?: {
    title?: string;
    content?: string;
    course_id?: string;
    tags?: string[];
  };
}

export default function NoteEditor({
  courses,
  children,
  open,
  onOpenChange,
  defaultValues = {},
}: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultValues.title || "");
  const [content, setContent] = useState(defaultValues.content || "");
  const [courseId, setCourseId] = useState(defaultValues.course_id || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(defaultValues.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const noteData = {
        title,
        content,
        course_id: courseId || null,
        tags,
        user_id: userData.user.id,
        updated_at: new Date().toISOString(),
      };

      const { error: saveError } = await supabase
        .from("notes")
        .insert(noteData);

      if (saveError) throw saveError;

      // Reset form
      setTitle("");
      setContent("");
      setCourseId("");
      setTags([]);

      // Close dialog
      if (onOpenChange) onOpenChange(false);

      // Refresh the page to show the new note
      router.refresh();
    } catch (err: any) {
      console.error("Error saving note:", err);
      setError(err.message || "Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use conditional rendering instead of Fragment
  const isControlled = open !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="course">Course</Label>
              <Select
                value={courseId}
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <div className="h-[300px] border rounded-md">
              <BlocknoteEditor
                initialContent={content}
                onChange={handleContentChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
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
          {error && (
            <div className="text-sm font-medium text-red-500">{error}</div>
          )}
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
            onClick={handleSave}
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
