


import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  Brain,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: Receipt,
  },
  {
    name: "Budgets",
    path: "/budgets",
    icon: Wallet,
  },
  {
    name: "SmartSave",
    path: "/smart-save",
    icon: PiggyBank,
  },
  {
    name: "Insights",
    path: "/insights",
    icon: Brain,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const Sidebar = () => {
  return (
    <aside
      className="
        top-0 left-0 fixed flex flex-col
        w-64 h-screen
        text-white
        bg-primary
      "
    >
      {/* LOGO */}
      <div
        className="
          flex items-center
          h-16
          px-6
          border-white/10 border-b
        "
      >
        <h1
          className="
            font-bold text-xl tracking-wide
          "
        >
          SmartBudget
        </h1>
      </div>

      {/* NAVIGATION */}
      <nav
        className="
          flex-1 overflow-y-auto
          space-y-2 px-4 py-6
        "
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-white/10 text-accent"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div
        className="
          p-4
          text-gray-400 text-xs
          border-white/10 border-t
        "
      >
        <p>© {new Date().getFullYear()} SmartBudget</p>
      </div>
    </aside>
  );
};

export default Sidebar;
