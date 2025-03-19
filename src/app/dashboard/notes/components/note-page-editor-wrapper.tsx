"use client";

import { useRouter } from "next/navigation";
import NotePageEditor from "./note-page-editor";

interface NotePageEditorWrapperProps {
  noteId: string;
  courses: any[];
  folders: any[];
  userId: string;
  initialData: {
    title?: string;
    content?: string;
    course_id?: string | null;
    folder_id?: string | null;
    tags?: string[] | null;
  };
}

export default function NotePageEditorWrapper({
  noteId,
  courses,
  folders,
  userId,
  initialData,
}: NotePageEditorWrapperProps) {
  const router = useRouter();

  const handleBackFromEdit = () => {
    router.push("/dashboard/notes");
  };

  return (
    <NotePageEditor
      noteId={noteId}
      courses={courses}
      folders={folders}
      userId={userId}
      initialData={initialData}
      onBack={handleBackFromEdit}
    />
  );
}
