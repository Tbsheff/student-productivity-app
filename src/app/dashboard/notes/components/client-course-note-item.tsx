"use client";

import { useState } from "react";
import NoteDetail from "./note-detail";

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

interface Course {
    id: string;
    name: string;
    color: string;
}

export default function ClientCourseNoteItem({
    note,
    courses
}: {
    note: Note;
    courses: Course[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className="p-2 rounded-md border hover:bg-accent cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <div className="font-medium line-clamp-1">
                    {note.title}
                </div>
                <div className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString()}
                </div>
            </div>

            <NoteDetail
                noteId={note.id}
                open={isOpen}
                onOpenChange={setIsOpen}
                courses={courses}
            />
        </>
    );
} 