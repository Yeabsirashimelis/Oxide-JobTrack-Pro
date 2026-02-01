import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="ml-64">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
