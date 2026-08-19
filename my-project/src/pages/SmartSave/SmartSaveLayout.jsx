import { Outlet } from "react-router-dom";

import SmartSaveHeader from "./components/SmartSaveHeader";

/* =========================================================
   SMARTSAVE LAYOUT
   ---------------------------------------------------------
   Shared shell for every SmartSave route.

   The header remains mounted while the child page changes.
========================================================= */

const SmartSaveLayout = () => {
  return (
    <div
      className="
        min-h-screen
        bg-slate-50
      "
    >
      {/* =====================================================
          PERSISTENT SMARTSAVE NAVIGATION
      ===================================================== */}

      <header
        className="
          top-0 z-50 sticky
          w-full
        "
      >
        <SmartSaveHeader />
      </header>

      {/* =====================================================
          CURRENT SMARTSAVE PAGE
      ===================================================== */}

      <main
        className="
          w-full
        "
      >
        <Outlet />
      </main>
    </div>
  );
};

export default SmartSaveLayout;