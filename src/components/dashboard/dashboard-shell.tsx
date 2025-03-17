import Sidebar from "./sidebar";
import DashboardHeader from "./dashboard-header";

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardShell({
  children,
  title,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex flex-1 flex-col">
          <DashboardHeader title={title} />
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
