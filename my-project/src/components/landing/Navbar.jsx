




import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CommandPalette from "../ui/CommandPalette";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { id: "features", label: "Platform" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Customers" },
  { id: "security", label: "Security" },
];

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      NAV_ITEMS.forEach((item) => {
        const el = document.getElementById(item.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        if (rect.top <= 140 && rect.bottom >= 140) {
          setActive(item.id);
        }
      });
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSection = (id) => {
    setActive(id);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }

    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* =======================
            BANK SURFACE LAYER
        ======================= */}
        <div
          className={`
            w-full border-b
            transition-all duration-200
            ${
              scrolled
                ? "bg-white border-slate-200 shadow-sm"
                : "bg-white border-transparent"
            }
          `}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-[72px] flex items-center justify-between">

              {/* =======================
                  BRAND BLOCK
              ======================= */}
              <div className="flex items-center gap-10">

                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      SB
                    </span>
                  </div>

                  <div className="leading-tight">
                    <h1 className="text-[14px] font-semibold text-slate-900">
                      SmartBudget
                    </h1>

                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck size={12} className="text-slate-500" />
                      <span className="text-[11px] text-slate-500">
                        Bank-grade financial system
                      </span>
                    </div>
                  </div>
                </button>

                {/* DESKTOP NAV */}
                <nav className="hidden lg:flex items-center gap-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = active === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => goToSection(item.id)}
                        className={`
                          relative px-4 h-[72px]
                          text-[13px] font-medium
                          transition
                          ${
                            isActive
                              ? "text-slate-900"
                              : "text-slate-500 hover:text-slate-900"
                          }
                        `}
                      >
                        {item.label}

                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* =======================
                  ACTION AREA
              ======================= */}
              <div className="hidden lg:flex items-center gap-3">

                {/* SEARCH */}
                <button
                  onClick={() => setCmdOpen(true)}
                  className="h-9 px-3 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-500 hover:text-slate-700"
                >
                  <Search size={14} />
                  <span className="text-[12px]">Search</span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    ⌘K
                  </span>
                </button>

                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-[13px] text-slate-600 hover:text-slate-900"
                    >
                      Sign In
                    </button>

                    <button
                      onClick={() => navigate("/signup")}
                      className="h-9 px-4 bg-slate-900 text-white text-[13px] font-medium rounded-lg hover:bg-slate-800"
                    >
                      Open Account
                      <ArrowRight size={14} className="ml-2 inline" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/app")}
                      className="h-9 px-3 border border-slate-200 rounded-lg text-[13px]"
                    >
                      <LayoutDashboard size={14} className="inline mr-1" />
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="text-[13px] text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* MOBILE */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden h-9 w-9 border border-slate-200 rounded-lg flex items-center justify-center"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* =======================
              MOBILE PANEL
          ======================= */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="lg:hidden border-t border-slate-200 bg-white"
              >
                <div className="px-4 py-4 space-y-2">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => goToSection(item.id)}
                      className="w-full text-left px-3 py-2 text-[14px] text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};

export default Navbar;