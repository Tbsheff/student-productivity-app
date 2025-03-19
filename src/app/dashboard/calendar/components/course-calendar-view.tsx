"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskEvent from "./task-event";
import React from "react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  course: string | null;
  due_date: string | null;
  priority: string | null;
  status: string | null;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
  type?: "assignment" | "exam" | "announcement";
}

interface CourseCalendarViewProps {
  tasks: Task[];
  initialDate?: Date;
}

export default function CourseCalendarView({
  tasks,
  initialDate = new Date(),
}: CourseCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [visibleCourses, setVisibleCourses] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState({
    assignments: true,
    exams: true,
    myTextItems: true,
    instructorTextItems: true,
    completedItems: true,
    pathItems: true,
    universityDates: true,
  });

  // Extract unique courses from tasks
  const allCourses = Array.from(
    new Set(
      tasks.filter((task) => task.course).map((task) => task.course as string),
    ),
  );

  // Initialize visible courses on first render
  useEffect(() => {
    setVisibleCourses(allCourses);
  }, []);

  // Get current week dates
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    // Find the previous Sunday
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Format date range for display (e.g., "Mar 16-22")
  const formatDateRange = () => {
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    const startMonth = startDate.toLocaleString("default", { month: "short" });
    const endMonth = endDate.toLocaleString("default", { month: "short" });

    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}`;
    } else {
      return `${startMonth} ${startDate.getDate()}-${endMonth} ${endDate.getDate()}`;
    }
  };

  // Navigate to previous week
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  // Navigate to next week
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get tasks for a specific day and course
  const getTasksForDayAndCourse = (date: Date, course: string) => {
    return tasks.filter((task) => {
      if (!task.due_date || task.course !== course) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Toggle all courses
  const toggleAllCourses = (checked: boolean) => {
    setVisibleCourses(checked ? [...allCourses] : []);
  };

  // Toggle a specific course
  const toggleCourse = (course: string) => {
    setVisibleCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course],
    );
  };

  // Toggle all event types
  const toggleAllEventTypes = (checked: boolean) => {
    setEventTypes({
      assignments: checked,
      exams: checked,
      myTextItems: checked,
      instructorTextItems: checked,
      completedItems: checked,
      pathItems: checked,
      universityDates: checked,
    });
  };

  // Toggle a specific event type
  const toggleEventType = (type: keyof typeof eventTypes) => {
    setEventTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Filter tasks based on selected event types
  const filterTasksByEventType = (tasks: Task[]) => {
    return tasks.filter((task) => {
      // For now, we'll use a simple heuristic to determine task type
      // In a real implementation, this would come from the task data
      const isAssignment =
        task.title?.toLowerCase().includes("assignment") ||
        task.title?.toLowerCase().includes("project") ||
        task.priority === "high";
      const isExam =
        task.title?.toLowerCase().includes("exam") ||
        task.title?.toLowerCase().includes("test") ||
        task.title?.toLowerCase().includes("quiz");
      const isAnnouncement = !isAssignment && !isExam;

      if (isAssignment && !eventTypes.assignments) return false;
      if (isExam && !eventTypes.exams) return false;
      if (isAnnouncement && !eventTypes.myTextItems) return false;

      return true;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">Combined Schedule</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium min-w-[100px] text-center">
              {formatDateRange()}
            </div>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-8 border-b">
                <div className="py-2 px-3 text-sm font-medium border-r">
                  Course
                </div>
                {weekDates.map((date, index) => (
                  <div
                    key={index}
                    className={`py-2 text-center text-sm font-medium ${isToday(date) ? "bg-indigo-50 dark:bg-indigo-950/20" : ""}`}
                  >
                    <div>
                      {date.toLocaleString("default", { weekday: "short" })}
                    </div>
                    <div>
                      {date.toLocaleString("default", { month: "short" })}{" "}
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="divide-y">
                {visibleCourses.map((course) => (
                  <div key={course} className="grid grid-cols-8">
                    <div className="py-2 px-3 text-sm font-medium border-r bg-muted/50">
                      {course}
                    </div>
                    {weekDates.map((date, index) => {
                      const dayTasks = filterTasksByEventType(
                        getTasksForDayAndCourse(date, course),
                      );
                      return (
                        <div
                          key={index}
                          className={`p-1 min-h-[100px] ${isToday(date) ? "bg-indigo-50 dark:bg-indigo-950/20" : ""}`}
                        >
                          {dayTasks.map((task) => (
                            <TaskEvent
                              key={task.id}
                              task={task}
                              className="mb-1"
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">View:</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => toggleAllEventTypes(true)}
                      >
                        Check all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => toggleAllEventTypes(false)}
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assignments"
                        checked={eventTypes.assignments}
                        onCheckedChange={() => toggleEventType("assignments")}
                      />
                      <label htmlFor="assignments" className="text-sm">
                        Assignments
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exams"
                        checked={eventTypes.exams}
                        onCheckedChange={() => toggleEventType("exams")}
                      />
                      <label htmlFor="exams" className="text-sm">
                        Exams
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="myTextItems"
                        checked={eventTypes.myTextItems}
                        onCheckedChange={() => toggleEventType("myTextItems")}
                      />
                      <label htmlFor="myTextItems" className="text-sm">
                        My text items
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="instructorTextItems"
                        checked={eventTypes.instructorTextItems}
                        onCheckedChange={() =>
                          toggleEventType("instructorTextItems")
                        }
                      />
                      <label htmlFor="instructorTextItems" className="text-sm">
                        Instructor text items
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="completedItems"
                        checked={eventTypes.completedItems}
                        onCheckedChange={() =>
                          toggleEventType("completedItems")
                        }
                      />
                      <label htmlFor="completedItems" className="text-sm">
                        Completed items
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pathItems"
                        checked={eventTypes.pathItems}
                        onCheckedChange={() => toggleEventType("pathItems")}
                      />
                      <label htmlFor="pathItems" className="text-sm">
                        Path items
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="universityDates"
                        checked={eventTypes.universityDates}
                        onCheckedChange={() =>
                          toggleEventType("universityDates")
                        }
                      />
                      <label htmlFor="universityDates" className="text-sm">
                        University dates
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Show courses:</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => toggleAllCourses(true)}
                      >
                        Check all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => toggleAllCourses(false)}
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {allCourses.map((course) => (
                      <div key={course} className="flex items-center space-x-2">
                        <Checkbox
                          id={`course-${course}`}
                          checked={visibleCourses.includes(course)}
                          onCheckedChange={() => toggleCourse(course)}
                        />
                        <label htmlFor={`course-${course}`} className="text-sm">
                          {course}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
