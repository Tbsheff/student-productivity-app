"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { createClient } from "@/utils/supabase-client";
import { PartialBlock } from "@blocknote/core";

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedContent, setSavedContent] = useState<string>(initialContent || "");

  // Parse initial content if provided
  const initialBlocks = useMemo(() => {
    if (!initialContent) return undefined;
    try {
      return JSON.parse(initialContent) as PartialBlock[];
    } catch (error) {
      console.error("Error parsing initial content:", error);
      return undefined;
    }
  }, [initialContent]);

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  // Save note to database
  const saveNote = useCallback(async (content: string) => {
    if (!noteId || !content) return;

    try {
      setIsSaving(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("notes")
        .update({
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId);

      if (error) throw error;

      setLastSaved(new Date());
      setSavedContent(content);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  }, [noteId]);

  // Handle editor content changes
  const handleChange = useCallback(() => {
    if (!editor) return;

    const contentAsJson = JSON.stringify(editor.document);

    // Call onChange callback if provided
    if (onChange) {
      onChange(contentAsJson);
    }

    // Debounce auto-save
    const saveTimeout = setTimeout(() => {
      if (!readOnly && noteId && contentAsJson !== savedContent) {
        saveNote(contentAsJson);
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [editor, onChange, readOnly, noteId, savedContent, saveNote]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto bg-background border rounded-md">
        <BlockNoteView
          editor={editor}
          theme="light"
          editable={!readOnly}
          onChange={handleChange}
        />
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
