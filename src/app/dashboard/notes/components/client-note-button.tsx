"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the NoteEditor component
// Using a more reliable dynamic import pattern
const DynamicNoteEditor = dynamic(
    () => import("./note-editor"),
    {
        ssr: false,
        loading: () => <p className="p-4 text-center">Loading editor...</p>
    }
);

interface Course {
    id: string;
    name: string;
    color: string;
}

interface ClientNoteButtonProps {
    courses: Course[];
    userId: string;
}

export default function ClientNoteButton({ courses, userId }: ClientNoteButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    return (
        <>
            <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleOpenChange(true)}
            >
                <Plus className="mr-2 h-4 w-4" /> New Note
            </Button>

            {/* Always render the component but control visibility with props */}
            <DynamicNoteEditor
                courses={courses}
                userId={userId}
                open={isOpen}
                onOpenChange={handleOpenChange}
            />
        </>
    );
} 