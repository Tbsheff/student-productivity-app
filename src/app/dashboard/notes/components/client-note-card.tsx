"use client";

import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Tag } from "lucide-react";
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

export default function ClientNoteCard({
    note,
    courses
}: {
    note: Note;
    courses: Course[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(true);
    };

    return (
        <>
            <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="line-clamp-1">
                                {note.title}
                            </CardTitle>
                            {note.courses && (
                                <CardDescription>
                                    <div className="flex items-center mt-1">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{
                                                backgroundColor:
                                                    note.courses.color || "#6366F1",
                                            }}
                                        />
                                        {note.courses.name}
                                    </div>
                                </CardDescription>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {new Date(note.updated_at).toLocaleDateString()}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="line-clamp-3 text-sm text-muted-foreground">
                        {note.content ? (
                            // If the content is JSON, try to extract and display plain text
                            (() => {
                                try {
                                    const contentObj = JSON.parse(note.content);
                                    // Extract text from the first block if it exists
                                    if (Array.isArray(contentObj) && contentObj.length > 0) {
                                        // Try to get text content from the first block
                                        const firstBlock = contentObj[0];
                                        if (typeof firstBlock.content === 'string') {
                                            return firstBlock.content;
                                        } else if (Array.isArray(firstBlock.content)) {
                                            // For BlockNote format where content might be an array of text nodes
                                            return firstBlock.content
                                                .filter((item: any) => item.type === 'text')
                                                .map((item: any) => item.text)
                                                .join(' ');
                                        }
                                    }
                                    return "No preview available";
                                } catch (e) {
                                    // If parsing fails, show the content as is
                                    return note.content;
                                }
                            })()
                        ) : (
                            "No content"
                        )}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
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
                </CardContent>
            </Card>

            <NoteDetail
                noteId={note.id}
                open={isOpen}
                onOpenChange={setIsOpen}
                courses={courses}
            />
        </>
    );
} 