import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Settings,
  FileText,
  PlusCircle,
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/app", icon: LayoutDashboard },
  { name: "Transactions", path: "/app/transactions", icon: CreditCard },
  { name: "Add Transaction", path: "/app/add", icon: PlusCircle },
  { name: "Budgets", path: "/app/budgets", icon: PieChart },
  { name: "Reports", path: "/app/reports", icon: FileText },
  { name: "Settings", path: "/app/settings", icon: Settings },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 hidden md:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

        <div className="p-5 font-bold text-xl text-indigo-600">
          SmartBudget
        </div>

        <nav className="flex flex-col gap-2 p-3">

          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                  ${active
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}

        </nav>

      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>

    </div>
  );
};



export default AppLayout;