

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Settings,
  FileText,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/app", icon: LayoutDashboard },
  { name: "Transactions", path: "/app/transactions", icon: CreditCard },
  { name: "Add Transaction", path: "/app/add", icon: PlusCircle },
  { name: "Budgets", path: "/app/budgets", icon: PieChart },
  { name: "Reports", path: "/app/reports", icon: FileText },
  { name: "Settings", path: "/app/settings", icon: Settings }, // ✅ ENSURED
];

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-72 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

  {/* BRAND HEADER */}
  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
    <h1 className="text-xl font-bold text-indigo-600 tracking-tight">
      SmartBudget
    </h1>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      Financial Control Center
    </p>
  </div>

  {/* NAV */}
  <nav className="flex flex-col gap-1 p-4">

    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
      Main Menu
    </p>

    {menu.map((item) => {
      const Icon = item.icon;
      const active = location.pathname === item.path;

      return (
        <button
          key={item.name}
          onClick={() => go(item.path)}
          className={`
            group flex items-center gap-3 px-4 py-3 rounded-xl
            transition-all duration-200 text-[15px] font-medium
            ${
              active
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
          `}
        >

          {/* ICON CONTAINER */}
          <span
            className={`
              flex items-center justify-center w-9 h-9 rounded-lg
              transition
              ${
                active
                  ? "bg-white/20"
                  : "bg-gray-100 dark:bg-gray-800 group-hover:scale-105"
              }
            `}
          >
            <Icon size={18} />
          </span>

          {/* LABEL */}
          <span className="tracking-tight">
            {item.name}
          </span>

          {/* ACTIVE INDICATOR */}
          {active && (
            <span className="ml-auto w-1.5 h-6 rounded-full bg-white/80" />
          )}

        </button>
      );
    })}

  </nav>

</aside>

      {/* ================= MOBILE TOP BAR ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">

        <button
  onClick={() => setOpen(true)}
  className="
    p-2 rounded-xl
    text-gray-800 dark:text-white
    hover:bg-gray-100 dark:hover:bg-gray-800
    active:scale-95 transition
  "
>
  <Menu className="w-6 h-6" />
</button>

        <h1 className="font-semibold text-indigo-600">
          SmartBudget
        </h1>

        <div className="w-6" />

      </div>

      {/* ================= DRAWER OVERLAY ================= */}
      {open && (
        <div className="fixed inset-0 z-[999]">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* DRAWER */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl flex flex-col">

            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">

              <h2 className="font-bold text-indigo-600">
                SmartBudget
              </h2>

              <button
  onClick={() => setOpen(false)}
  className="
    p-2 rounded-xl
    text-gray-800 dark:text-white
    hover:bg-gray-100 dark:hover:bg-gray-800
    active:scale-95 transition
    shadow-sm
  "
>
  <X className="w-6 h-6" />
</button>

            </div>

            {/* MENU */}
            <nav className="flex flex-col gap-2 p-3 overflow-y-auto">

              {menu.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <button
                    key={item.name}
                    onClick={() => go(item.path)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                      ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </button>
                );
              })}

            </nav>

          </div>

        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-6">
        <Outlet />
      </main>

    </div>
  );
};

export default AppLayout;