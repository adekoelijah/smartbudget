import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="
        flex
      "
    >
      {/* Desktop Sidebar */}
      <div
        className="
          hidden md:block
        "
      >
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="
            md:hidden z-50 fixed inset-0
            bg-black/40
          "
        >
          <div
            className="
              w-64 h-full
              p-6
              bg-primary
            "
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="
          w-full min-h-screen
          md:ml-64
          bg-bg
        "
      >
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main
          className="
            p-4 md:p-6
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;