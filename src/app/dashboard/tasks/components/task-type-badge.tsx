import { BookOpen, FileText, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskTypeBadgeProps {
  type: "assignment" | "exam" | "announcement";
}

export default function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  switch (type) {
    case "assignment":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
        >
          <FileText className="h-3 w-3 mr-1" /> Assignment
        </Badge>
      );
    case "exam":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-800"
        >
          <GraduationCap className="h-3 w-3 mr-1" /> Exam
        </Badge>
      );
    case "announcement":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-800"
        >
          <BookOpen className="h-3 w-3 mr-1" /> Announcement
        </Badge>
      );
    default:
      return null;
  }
}
