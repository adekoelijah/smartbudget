import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";


const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // 🧠 Derive page title from route
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/transactions")) return "Transactions";
    if (path.startsWith("/budgets")) return "Budgets";
    if (path.startsWith("/insights")) return "Insights";
    if (path.startsWith("/reports")) return "Reports";
    if (path.startsWith("/settings")) return "Settings";
    return "Dashboard";
  }, [location.pathname]);

  // 🧹 Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌨️ Keyboard shortcut: focus search with "/"
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔎 Debounced search trigger (placeholder for API)
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) {
        // TODO: call search endpoint or update global filter
        // console.log("Searching:", query);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* LEFT: Menu (mobile) + Title + Search */}
        <div className="flex items-center gap-3 w-full md:w-1/2">
          {/* Mobile sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <h1 className="text-lg md:text-xl font-semibold text-primary whitespace-nowrap">
            {pageTitle}
          </h1>

          {/* Search */}
          <div className="relative w-full max-w-md ml-2 hidden sm:block">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search (press /)"
              aria-label="Search"
              className="w-full border rounded-lg pl-4 pr-10 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              /
            </span>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 rounded hover:bg-gray-100"
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              aria-label="Notifications"
            >
              🔔
              <span className="absolute -top-1 -right-1 text-[10px] bg-danger text-white rounded-full px-1.5 py-0.5">
                3
              </span>
            </button>

            {notifOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-3 w-80 bg-white border rounded-xl shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b font-medium">
                  Notifications
                </div>

                <ul className="max-h-64 overflow-y-auto">
                  <li className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer">
                    Budget limit nearing in “Food”
                  </li>
                  <li className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer">
                    New insight generated for April
                  </li>
                </ul>

                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate("/reports");
                  }}
                  className="w-full text-sm px-4 py-2 border-t hover:bg-gray-50"
                >
                  View all
                </button>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${
                  user?.name || "User"
                }&background=1E293B&color=fff`}
                alt="User avatar"
                className="w-9 h-9 rounded-full"
              />

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {user?.email || ""}
                </p>
              </div>
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-3 w-52 bg-white border rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Settings
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Profile
                </button>

                <div className="border-t" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search (separate row) */}
      <div className="sm:hidden px-4 pb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search"
          className="w-full border rounded-lg px-4 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
    </header>
  );
};

export default Navbar;