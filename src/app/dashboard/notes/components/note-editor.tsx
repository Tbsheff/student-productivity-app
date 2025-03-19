"use client";
import React, { useCallback } from "react";
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
import { Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { DynamicBlocknoteEditor } from "./dynamic-editor";
import { createClient } from "@/utils/supabase-client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface Course {
  id: string;
  name: string;
  color: string;
}

interface NoteEditorProps {
  courses: Course[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userId: string; // Add userId for saving to the database
}

export default function NoteEditor({
  courses,
  open,
  onOpenChange,
  userId,
}: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // For uncontrolled dialog mode
  const [internalOpen, setInternalOpen] = useState(false);

  // Use either the controlled state or internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your note",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();

      // Create the note
      const { data, error } = await supabase.from("notes").insert({
        title,
        content,
        course_id: courseId || null,
        tags: tags.length > 0 ? tags : null,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select();

      if (error) throw error;

      // Reset form
      setTitle("");
      setContent("");
      setCourseId("");
      setTags([]);

      // Close dialog
      handleOpenChange(false);

      // Show success toast
      toast({
        title: "Note created",
        description: "Your note has been created successfully",
      });

      // Refresh the page to show the new note
      router.refresh();

    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "There was an error saving your note",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 h-full overflow-hidden">
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
                onValueChange={(value) => setCourseId(value === "none" ? "" : value)}
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
          <div className="grid gap-2 flex-grow overflow-hidden">
            <Label htmlFor="content">Content</Label>
            <div className="h-[350px] overflow-hidden">
              <DynamicBlocknoteEditor
                onChange={handleEditorContentChange}
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
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
            onClick={handleSave}
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
