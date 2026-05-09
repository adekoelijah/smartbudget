import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="w-64 bg-primary h-full p-6">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full md:ml-64 min-h-screen bg-bg">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;