import { ThemeSwitcher } from "@/components/theme-switcher";
import UserProfile from "@/components/user-profile";
import MobileSidebar from "./mobile-sidebar";

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <MobileSidebar />
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <UserProfile />
      </div>
    </header>
  );
}
