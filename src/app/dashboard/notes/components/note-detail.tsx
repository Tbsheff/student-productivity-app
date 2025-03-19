"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

