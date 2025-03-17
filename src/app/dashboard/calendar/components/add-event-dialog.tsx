"use client";

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
import { Plus } from "lucide-react";
import { useState } from "react";

interface Course {
  id: string;
  name: string;
  color: string;
}

interface AddEventDialogProps {
  courses: Course[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddEventDialog({
  courses,
  open,
  onOpenChange,
}: AddEventDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");

  const handleSave = () => {
    // Save event logic would go here
    console.log({ title, date, time, description, courseId });
    // Reset form
    setTitle("");
    setDate("");
    setTime("");
    setDescription("");
    setCourseId("");
    // Close dialog
    if (onOpenChange) onOpenChange(false);
  };

  const DialogComponent = open !== undefined ? React.Fragment : Dialog;
  const DialogContentComponent =
    open !== undefined ? React.Fragment : DialogContent;
  const dialogProps = open !== undefined ? {} : {};
  const dialogContentProps =
    open !== undefined
      ? {}
      : {
          className: "sm:max-w-[425px]",
        };

  return (
    <DialogComponent {...dialogProps}>
      {open === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </DialogTrigger>
      )}
      <DialogContentComponent {...dialogContentProps}>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter event description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="course">Course (Optional)</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Associate with a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: course.color || "#6366F1" }}
                      />
                      {course.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
            onClick={handleSave}
            disabled={!title || !date}
          >
            Save Event
          </Button>
        </div>
      </DialogContentComponent>
    </DialogComponent>
  );
}
