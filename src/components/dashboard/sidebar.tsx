"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  FileText,
  Home,
  ListTodo,
  Settings,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: <ListTodo className="h-5 w-5" />,
  },
  {
    name: "Calendar",
    href: "/dashboard/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    name: "Study Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    name: "Focus Tools",
    href: "/dashboard/focus",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    name: "Notes",
    href: "/dashboard/notes",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: "Goals",
    href: "/dashboard/goals",
    icon: <Target className="h-5 w-5" />,
  },
  {
    name: "AI Assistant",
    href: "/dashboard/assistant",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-background md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-14 items-center border-b px-4 py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-xl font-bold text-indigo-600">
              StudySmart AI
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
