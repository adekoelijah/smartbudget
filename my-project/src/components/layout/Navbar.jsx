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

  if (path.startsWith("/transactions")) {
    return "Transactions";
  }

  if (path.startsWith("/budgets")) {
    return "Budgets";
  }

  if (path.startsWith("/smart-save")) {
    return "SmartSave";
  }

  if (path.startsWith("/insights")) {
    return "Insights";
  }

  if (path.startsWith("/reports")) {
    return "Reports";
  }

  if (path.startsWith("/settings")) {
    return "Settings";
  }

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
    <header
      className="
        top-0 z-40 sticky
        bg-white/90
        border-b
        backdrop-blur
      "
    >
      <div
        className="
          flex justify-between items-center
          h-16
          px-4 md:px-6
          gap-4
        "
      >
        {/* LEFT: Menu (mobile) + Title + Search */}
        <div
          className="
            flex items-center
            w-full md:w-1/2
            gap-3
          "
        >
          {/* Mobile sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="
              md:hidden
              p-2
              hover:bg-gray-100
              rounded
            "
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <h1
            className="
              font-semibold text-primary text-lg md:text-xl whitespace-nowrap
            "
          >
            {pageTitle}
          </h1>

          {/* Search */}
          <div
            className="
              hidden sm:block relative
              w-full max-w-md
              ml-2
            "
          >
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search (press /)"
              aria-label="Search"
              className="py-2 pr-10 pl-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full text-sm"
            />
            <span
              className="
                top-1/2 right-3 absolute
                text-gray-400 text-xs
                -translate-y-1/2
              "
            >
              /
            </span>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div
          className="
            flex items-center
            gap-4 md:gap-6
          "
        >
          {/* Notifications */}
          <div
            className="
              relative
            "
            ref={notifRef}
          >
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative hover:bg-gray-100 p-2 rounded"
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              aria-label="Notifications"
            >
              🔔
              <span
                className="
                  absolute
                  px-1.5 py-0.5
                  text-[10px] text-white
                  bg-danger
                  rounded-full
                  -top-1 -right-1
                "
              >
                3
              </span>
            </button>

            {notifOpen && (
              <div
                role="menu"
                className="
                  right-0 absolute overflow-hidden
                  w-80
                  mt-3
                  bg-white
                  border rounded-xl
                  shadow-lg
                "
              >
                <div
                  className="
                    px-4 py-3
                    font-medium
                    border-b
                  "
                >
                  Notifications
                </div>

                <ul
                  className="
                    overflow-y-auto
                    max-h-64
                  "
                >
                  <li
                    className="
                      px-4 py-3
                      text-sm
                      hover:bg-gray-50
                      cursor-pointer
                    "
                  >
                    Budget limit nearing in “Food”
                  </li>
                  <li
                    className="
                      px-4 py-3
                      text-sm
                      hover:bg-gray-50
                      cursor-pointer
                    "
                  >
                    New insight generated for April
                  </li>
                </ul>

                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate("/reports");
                  }}
                  className="hover:bg-gray-50 px-4 py-2 border-t w-full text-sm"
                >
                  View all
                </button>
              </div>
            )}
          </div>

          {/* User */}
          <div
            className="
              relative
            "
            ref={dropdownRef}
          >
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded-lg"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${
                  user?.name || "User"
                }&background=1E293B&color=fff`}
                alt="User avatar"
                className="
                  w-9 h-9
                  rounded-full
                "
                /
              >

              <div
                className="
                  hidden md:block
                  text-left
                "
              >
                <p
                  className="
                    font-medium text-sm leading-tight
                  "
                >
                  {user?.name || "User"}
                </p>
                <p
                  className="
                    text-gray-500 text-xs leading-tight
                  "
                >
                  {user?.email || ""}
                </p>
              </div>
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="
                  right-0 absolute overflow-hidden
                  w-52
                  mt-3
                  bg-white
                  border rounded-xl
                  shadow-lg
                "
              >
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/settings");
                  }}
                  className="hover:bg-gray-50 px-4 py-2 w-full text-sm text-left"
                >
                  Settings
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="hover:bg-gray-50 px-4 py-2 w-full text-sm text-left"
                >
                  Profile
                </button>

                <div
                  className="
                    border-t
                  "
                  /
                >

                <button
                  onClick={handleLogout}
                  className="
                    w-full
                    px-4 py-2
                    text-danger text-sm text-left
                    hover:bg-gray-50
                  "
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search (separate row) */}
      <div
        className="
          sm:hidden
          px-4 pb-3
        "
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full text-sm"
        />
      </div>
    </header>
  );
};

export default Navbar;