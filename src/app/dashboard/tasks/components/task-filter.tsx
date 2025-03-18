"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Filter, Search, SortAsc, SortDesc } from "lucide-react";
import { useState, useEffect } from "react";

interface TaskFilterProps {
  onFilterChange: (filters: {
    search: string;
    priority: string[];
    course: string[];
    sortBy: string;
    sortDirection: "asc" | "desc";
  }) => void;
  courses: string[];
}

export default function TaskFilter({
  onFilterChange,
  courses,
}: TaskFilterProps) {
  const [search, setSearch] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("due_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Apply filters when any filter changes
  useEffect(() => {
    // Remove onFilterChange from the dependency array to prevent infinite loops
    onFilterChange({
      search,
      priority: selectedPriorities,
      course: selectedCourses,
      sortBy,
      sortDirection,
    });
  }, [
    search,
    selectedPriorities,
    selectedCourses,
    sortBy,
    sortDirection,
    // onFilterChange - removed to prevent infinite loop
  ]);

  // Toggle priority selection
  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority],
    );
  };

  // Toggle course selection
  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course],
    );
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={selectedPriorities.includes("high")}
            onCheckedChange={() => togglePriority("high")}
          >
            High
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedPriorities.includes("medium")}
            onCheckedChange={() => togglePriority("medium")}
          >
            Medium
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedPriorities.includes("low")}
            onCheckedChange={() => togglePriority("low")}
            className="mb-1"
          >
            Low
          </DropdownMenuCheckboxItem>

          {courses.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Course</DropdownMenuLabel>
              {courses.map((course) => (
                <DropdownMenuCheckboxItem
                  key={course}
                  checked={selectedCourses.includes(course)}
                  onCheckedChange={() => toggleCourse(course)}
                >
                  {course}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            {sortDirection === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={sortBy === "due_date"}
            onCheckedChange={() => setSortBy("due_date")}
          >
            Due Date
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === "priority"}
            onCheckedChange={() => setSortBy("priority")}
          >
            Priority
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === "title"}
            onCheckedChange={() => setSortBy("title")}
          >
            Title
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === "created_at"}
            onCheckedChange={() => setSortBy("created_at")}
          >
            Created Date
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortDirection === "asc"}
            onCheckedChange={toggleSortDirection}
          >
            Ascending
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortDirection === "desc"}
            onCheckedChange={toggleSortDirection}
          >
            Descending
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
