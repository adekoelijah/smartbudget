
import { useCallback, useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  PiggyBank,
  FileText,
  PlusCircle,
  Settings,
  Menu,
  X,
} from "lucide-react";

/* =========================================================
   NAVIGATION CONFIGURATION
========================================================= */

const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/app",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Transactions",
    path: "/app/transactions",
    icon: CreditCard,
  },
  {
    name: "Add Transaction",
    path: "/app/add",
    icon: PlusCircle,
  },
  {
    name: "Budgets",
    path: "/app/budgets",
    icon: PieChart,
  },
  {
    name: "Smart Save",
    path: "/app/smart-save",
    icon: PiggyBank,
  },
  {
    name: "Reports",
    path: "/app/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "/app/settings",
    icon: Settings,
  },
];

/* =========================================================
   NAVIGATION ITEM
========================================================= */

const NavigationItem = ({
  item,
  active,
  onNavigate,
  mobile = false,
}) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(item.path)}
      aria-current={active ? "page" : undefined}
      className={`
        group
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        text-left
        font-medium
        transition-colors
        duration-200
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-indigo-500
        ${
          mobile
            ? "px-4 py-3 text-sm"
            : "px-4 py-3 text-[15px]"
        }
        ${
          active
            ? "bg-indigo-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }
      `}
    >
      {/* ICON */}

      <span
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          transition-transform
          duration-200
          ${
            active
              ? "bg-white/20"
              : "bg-gray-100 group-hover:scale-105 dark:bg-gray-800"
          }
        `}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={1.9} />
      </span>

      {/* LABEL */}

      <span
        className="
          flex-1
          min-w-0
          truncate
        "
      >
        {item.name}
      </span>

      {/* ACTIVE INDICATOR */}

      {active && !mobile && (
        <span
          className="
            w-1.5 h-6
            bg-white/80
            rounded-full
            shrink-0
          "
          aria-hidden="true"
        /
        >
      )}
    </button>
  );
};

/* =========================================================
   DESKTOP SIDEBAR
========================================================= */

const DesktopSidebar = ({
  currentPath,
  onNavigate,
}) => {
  const isActive = useCallback(
    (item) => {
      if (item.end) {
        return currentPath === item.path;
      }

      return (
        currentPath === item.path ||
        currentPath.startsWith(
          `${item.path}/`
        )
      );
    },
    [currentPath]
  );

  return (
    <aside
      className="
        hidden flex-col md:flex
        w-72
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-800 border-r
        shrink-0
      "
      aria-label="Main navigation"
    >
      {/* BRAND */}

      <div
        className="
          p-6
          border-gray-200 dark:border-gray-800 border-b
        "
      >
        <h1
          className="
            font-bold text-indigo-600 text-xl tracking-tight
          "
        >
          SmartBudget
        </h1>

        <p
          className="
            mt-1
            text-gray-500 dark:text-gray-400 text-xs
          "
        >
          Financial Control Center
        </p>
      </div>

      {/* NAVIGATION */}

      <nav
        className="
          flex-1 overflow-y-auto
          p-4
        "
      >
        <p
          className="
            mb-3 px-2
            font-semibold text-gray-400 text-xs uppercase tracking-widest
          "
        >
          Main Menu
        </p>

        <div
          className="
            flex flex-col
            gap-1
          "
        >
          {NAV_ITEMS.map((item) => (
            <NavigationItem
              key={item.path}
              item={item}
              active={isActive(item)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* FOOTER */}

      <div
        className="
          px-6 py-4
          border-gray-200 dark:border-gray-800 border-t
        "
      >
        <p
          className="
            text-gray-400 text-xs
          "
        >
          © {new Date().getFullYear()} SmartBudget
        </p>
      </div>
    </aside>
  );
};

/* =========================================================
   MOBILE HEADER
========================================================= */

const MobileHeader = ({
  onOpenMenu,
}) => {
  return (
    <header
      className="
        md:hidden top-0 z-40 fixed inset-x-0 flex justify-between items-center
        h-16
        px-4
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-800 border-b
      "
    >
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        className="
          p-2
          text-gray-800 dark:text-white
          hover:bg-gray-100 dark:hover:bg-gray-800
          rounded-xl focus:outline-none
          transition-colors
          focus-visible:ring-2 focus-visible:ring-indigo-500
        "
      >
        <Menu
          className="
            w-6 h-6
          "
          aria-hidden="true"
        /
        >
      </button>

      <h1
        className="
          font-semibold text-indigo-600 tracking-tight
        "
      >
        SmartBudget
      </h1>

      {/* BALANCER */}

      <div
        className="
          w-10 h-10
        "
        aria-hidden="true"
      /
      >
    </header>
  );
};

/* =========================================================
   MOBILE DRAWER
========================================================= */

const MobileDrawer = ({
  open,
  currentPath,
  onClose,
  onNavigate,
}) => {
  const isActive = useCallback(
    (item) => {
      if (item.end) {
        return currentPath === item.path;
      }

      return (
        currentPath === item.path ||
        currentPath.startsWith(
          `${item.path}/`
        )
      );
    },
    [currentPath]
  );

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [open]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        md:hidden z-[100] fixed inset-0
      "
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="
          absolute inset-0
          w-full h-full
          bg-black/60
          focus:outline-none
          backdrop-blur-[1px]
          cursor-default
        "
        /
      >

      {/* DRAWER */}

      <aside
        className="
          z-10 relative flex flex-col
          w-[min(18rem,85vw)] h-full
          bg-white dark:bg-gray-900
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex justify-between items-center
            h-16
            px-5
            border-gray-200 dark:border-gray-800 border-b
            shrink-0
          "
        >
          <div>
            <h2
              className="
                font-bold text-indigo-600 tracking-tight
              "
            >
              SmartBudget
            </h2>

            <p
              className="
                mt-0.5
                text-[11px] text-gray-400
              "
            >
              Financial Control Center
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="
              p-2
              text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              rounded-xl focus:outline-none
              transition-colors
              focus-visible:ring-2 focus-visible:ring-indigo-500
            "
          >
            <X
              className="
                w-6 h-6
              "
              aria-hidden="true"
            /
            >
          </button>
        </div>

        {/* NAVIGATION */}

        <nav
          className="
            flex-1 overflow-y-auto
            p-3
          "
        >
          <div
            className="
              flex flex-col
              gap-1
            "
          >
            {NAV_ITEMS.map((item) => (
              <NavigationItem
                key={item.path}
                item={item}
                active={isActive(item)}
                onNavigate={onNavigate}
                mobile
              />
            ))}
          </div>
        </nav>

        {/* FOOTER */}

        <div
          className="
            px-5 py-4
            border-gray-200 dark:border-gray-800 border-t
            shrink-0
          "
        >
          <p
            className="
              text-gray-400 text-xs
            "
          >
            © {new Date().getFullYear()} SmartBudget
          </p>
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   APP LAYOUT
========================================================= */

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigate = useCallback(
    (path) => {
      setMobileMenuOpen(false);
      navigate(path);
    },
    [navigate]
  );

  /* =======================================================
     CLOSE MOBILE MENU WHEN ROUTE CHANGES
  ======================================================= */


  return (
    <div
      className="
        flex
        min-h-screen
        bg-gray-50 dark:bg-gray-950
      "
    >
      {/* DESKTOP SIDEBAR */}

      <DesktopSidebar
        currentPath={
          location.pathname
        }
        onNavigate={
          handleNavigate
        }
      />

      {/* MOBILE HEADER */}

      <MobileHeader
        onOpenMenu={() =>
          setMobileMenuOpen(true)
        }
      />

      {/* MOBILE DRAWER */}

      <MobileDrawer
        open={mobileMenuOpen}
        currentPath={
          location.pathname
        }
        onClose={() =>
          setMobileMenuOpen(false)
        }
        onNavigate={
          handleNavigate
        }
      />

      {/* MAIN CONTENT */}

      <main
        className="
          flex-1
          min-w-0
          pt-16 md:pt-0
        "
      >
        <div
          className="
            min-h-screen
            p-4 md:p-6
          "
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
