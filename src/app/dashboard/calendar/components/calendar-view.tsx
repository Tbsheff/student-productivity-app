"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarDay from "./calendar-day";
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
}

interface CalendarViewProps {
  tasks: Task[];
  initialDate?: Date;
  view?: "month" | "week" | "day";
}

export default function CalendarView({
  tasks,
  initialDate = new Date(),
  view: initialView = "month",
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<"month" | "week" | "day">(initialView);

  // Get current month and year
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  // Navigate to previous month/week/day
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next month/week/day
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to today
  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Generate days for the current month view
  const generateMonthView = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ).getDay();

    // Calculate days from previous month to show (adjust for Monday as first day)
    const daysFromPrevMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Generate calendar days array
    const calendarDays = [];

    // Add days from previous month
    const prevMonthDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    ).getDate();

    for (
      let i = prevMonthDays - daysFromPrevMonth + 1;
      i <= prevMonthDays;
      i++
    ) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        i,
      );
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i,
      );
      calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
      });
    }

    // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        i,
      );
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
      });
    }

    // Group calendar days into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return weeks;
  };

  // Generate days for the current week view
  const generateWeekView = () => {
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1; // Calculate days to subtract to get to Monday

    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - mondayOffset);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDays.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: isSameDay(date, new Date()),
      });
    }

    return [weekDays]; // Return as a single week array to match month view structure
  };

  // Generate the day view (just the current day)
  const generateDayView = () => {
    return [
      [
        {
          date: currentDate,
          isCurrentMonth: true,
          isToday: isSameDay(currentDate, new Date()),
        },
      ],
    ];
  };

  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Get tasks for a specific day
  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date);
    });
  };

  // Get days based on current view
  const getDays = () => {
    switch (view) {
      case "month":
        return generateMonthView();
      case "week":
        return generateWeekView();
      case "day":
        return generateDayView();
      default:
        return generateMonthView();
    }
  };

  // Get view title
  const getViewTitle = () => {
    if (view === "month") {
      return `${currentMonth} ${currentYear}`;
    } else if (view === "week") {
      const weekDays = generateWeekView()[0];
      const startDate = weekDays[0].date.getDate();
      const startMonth = weekDays[0].date.toLocaleString("default", {
        month: "short",
      });
      const endDate = weekDays[6].date.getDate();
      const endMonth = weekDays[6].date.toLocaleString("default", {
        month: "short",
      });

      if (startMonth === endMonth) {
        return `${startDate} - ${endDate} ${startMonth} ${currentYear}`;
      } else {
        return `${startDate} ${startMonth} - ${endDate} ${endMonth} ${currentYear}`;
      }
    } else {
      return currentDate.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const days = getDays();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            className={
              view === "month" ? "bg-indigo-600 hover:bg-indigo-700" : ""
            }
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
            className={
              view === "week" ? "bg-indigo-600 hover:bg-indigo-700" : ""
            }
          >
            Week
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
            className={
              view === "day" ? "bg-indigo-600 hover:bg-indigo-700" : ""
            }
          >
            Day
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium min-w-[200px] text-center">
              {getViewTitle()}
            </div>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="py-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          <div
            className={`grid grid-cols-7 ${view === "day" ? "grid-rows-1 h-[600px]" : view === "week" ? "grid-rows-1 h-[600px]" : "grid-rows-6 h-[600px]"}`}
          >
            {days.map((week, weekIndex) => (
              <React.Fragment key={`week-${weekIndex}`}>
                {week.map((day, dayIndex) => (
                  <CalendarDay
                    key={`${weekIndex}-${dayIndex}`}
                    date={day.date}
                    isCurrentMonth={day.isCurrentMonth}
                    isToday={day.isToday}
                    tasks={getTasksForDay(day.date)}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
