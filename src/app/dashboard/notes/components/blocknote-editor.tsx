"use client";

import { useState, useEffect, useCallback } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import "@blocknote/react/style.css";
import { createClient } from "@/utils/supabase-client";

interface BlocknoteEditorProps {
  initialContent?: string;
  noteId?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export default function BlocknoteEditor({
  initialContent,
  noteId,
  onChange,
  readOnly = false,
}: BlocknoteEditorProps) {
  const [savedContent, setSavedContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Parse initial content if provided
  const getInitialContent = useCallback(() => {
    if (!initialContent) return undefined;

    try {
      return JSON.parse(initialContent) as PartialBlock[];
    } catch (error) {
      console.error("Error parsing initial content:", error);
      return undefined;
    }
  }, [initialContent]);

  // Create editor instance
  const editor = useBlockNote({
    initialContent: getInitialContent(),
    editable: !readOnly,
    onEditorContentChange: (editor) => {
      // Get current content as JSON
      const contentAsJson = JSON.stringify(editor.topLevelBlocks);

      // Call onChange callback if provided
      if (onChange) {
        onChange(contentAsJson);
      }

      // Update saved content state
      setSavedContent(contentAsJson);
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!noteId || readOnly) return;

    // Debounce save to avoid too many requests
    const saveTimeout = setTimeout(() => {
      if (savedContent && savedContent !== initialContent) {
        saveNote();
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [savedContent, noteId, readOnly, initialContent]);

  // Save note to database
  const saveNote = async () => {
    if (!noteId || !savedContent) return;

    try {
      setIsSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("notes")
        .update({
          content: savedContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId);

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto bg-background border rounded-md">
        {editor && editor.reactEditor}
      </div>

      {noteId && !readOnly && (
        <div className="text-xs text-muted-foreground mt-2 flex justify-between">
          <div>
            {isSaving
              ? "Saving..."
              : lastSaved
                ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                : "Not saved yet"}
          </div>
          <div>
            {savedContent !== initialContent && !isSaving && "Unsaved changes"}
          </div>
        </div>
      )}
    </div>
  );
}
