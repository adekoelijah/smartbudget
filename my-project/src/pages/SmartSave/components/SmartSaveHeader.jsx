import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Menu,
  Target,
  Trophy,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

/* =========================================================
   NAVIGATION CONFIGURATION
========================================================= */

const SMART_SAVE_NAVIGATION = [
  {
    label: "Overview",
    description: "SmartSave dashboard",
    path: "/app/smart-save",
    icon: BarChart3,
  },
  {
    label: "Goals",
    description: "Track savings targets",
    path: "/app/smart-save/goals",
    icon: Target,
  },
  {
    label: "Activity",
    description: "Review savings activity",
    path: "/app/smart-save/activity",
    icon: Activity,
  },
  {
    label: "Challenges",
    description: "Build better saving habits",
    path: "/app/smart-save/challenges",
    icon: Trophy,
  },
  {
    label: "Forecast",
    description: "View future savings outlook",
    path: "/app/smart-save/forecast",
    icon: TrendingUp,
  },
  {
    label: "Insights",
    description: "Financial intelligence",
    path: "/app/smart-save/insights",
    icon: Lightbulb,
  },
  {
    label: "Strategies",
    description: "Manage saving strategies",
    path: "/app/smart-save/strategies",
    icon: Zap,
  },
];

/* =========================================================
   ACTIVE PATH HELPERS
========================================================= */

const isNavigationItemActive = (
  pathname,
  itemPath
) => {
  if (itemPath === "/app/smart-save") {
    return pathname === itemPath;
  }

  return (
    pathname === itemPath ||
    pathname.startsWith(`${itemPath}/`)
  );
};

/* =========================================================
   DESKTOP NAVIGATION ITEM
========================================================= */

const DesktopNavigationItem = ({
  item,
  pathname,
}) => {
  const Icon = item.icon;

  const isActive = isNavigationItemActive(
    pathname,
    item.path
  );

  return (
    <NavLink
      to={item.path}
      end={item.path === "/app/smart-save"}
      className={`
        group
        relative
        inline-flex
        items-center
        gap-2
        min-h-10
        px-3
        rounded-lg
        text-sm
        font-semibold
        transition-colors
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-slate-400
        focus-visible:ring-offset-2
        ${
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }
      `}
      aria-current={isActive ? "page" : undefined}
      title={item.description}
    >
      <Icon
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />

      <span>{item.label}</span>
    </NavLink>
  );
};

/* =========================================================
   MOBILE NAVIGATION ITEM
========================================================= */

const MobileNavigationItem = ({
  item,
  pathname,
  onNavigate,
}) => {
  const Icon = item.icon;

  const isActive = isNavigationItemActive(
    pathname,
    item.path
  );

  return (
    <NavLink
      to={item.path}
      end={item.path === "/app/smart-save"}
      onClick={onNavigate}
      className={`
        flex
        items-center
        w-full
        min-h-12
        px-3
        rounded-xl
        transition-colors
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-slate-400
        ${
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-100"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={`
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-lg
          shrink-0
          ${
            isActive
              ? "bg-white/10"
              : "bg-slate-100"
          }
        `}
      >
        <Icon
          size={17}
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>

      <span
        className="
          flex-1
          min-w-0
          ml-3
          text-left
        "
      >
        <span
          className="
            block
            font-semibold text-sm
          "
        >
          {item.label}
        </span>

        <span
          className={`
            block
            mt-0.5
            text-xs
            truncate
            ${
              isActive
                ? "text-slate-300"
                : "text-slate-500"
            }
          `}
        >
          {item.description}
        </span>
      </span>

      <ChevronRight
        size={16}
        className={
          isActive
            ? "text-slate-300"
            : "text-slate-400"
        }
        aria-hidden="true"
      />
    </NavLink>
  );
};

/* =========================================================
   SMART SAVE HEADER
========================================================= */

const SmartSaveHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const pathname = location.pathname;

  const currentNavigation =
    SMART_SAVE_NAVIGATION.find(
      (item) =>
        isNavigationItemActive(
          pathname,
          item.path
        )
    ) ??
    SMART_SAVE_NAVIGATION[0];

  const CurrentIcon =
    currentNavigation.icon;

  const handleOverviewNavigation = () => {
    setMobileMenuOpen(false);
    navigate("/app/smart-save");
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(
      (current) => !current
    );
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="
        top-0 z-40 sticky
        w-full
        bg-white/95
        border-slate-200 border-b
        backdrop-blur-xl
      "
    >
      <div
        className="
          w-full max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8
        "
      >
        {/* =================================================
            PRIMARY HEADER
        ================================================= */}

        <div
          className="
            flex justify-between items-center
            min-h-[68px]
            gap-4
          "
        >
          {/* BRAND */}

          <button
            type="button"
            onClick={handleOverviewNavigation}
            className="
              flex items-center
              min-w-0
              rounded-xl focus:outline-none
              gap-3
              focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
            "
            aria-label="Go to SmartSave overview"
          >
            <span
              className="
                flex justify-center items-center
                w-10 h-10
                bg-slate-900
                rounded-xl
                shadow-sm
                shrink-0
              "
            >
              <Zap
                size={19}
                className="
                  text-white
                "
                strokeWidth={2.2}
                aria-hidden="true"
              /
              >
            </span>

            <span
              className="
                hidden xs:block
                min-w-0
                text-left
              "
            >
              <span
                className="
                  block
                  font-bold text-slate-900 text-sm sm:text-base leading-tight
                "
              >
                SmartSave
              </span>

              <span
                className="
                  hidden sm:block
                  mt-0.5
                  font-medium text-[11px] text-slate-500
                "
              >
                Savings intelligence
              </span>
            </span>
          </button>

          {/* DESKTOP NAVIGATION */}

          <nav
            className="
              hidden flex-1 xl:flex justify-center items-center
              min-w-0
              gap-1
            "
            aria-label="SmartSave navigation"
          >
            {SMART_SAVE_NAVIGATION.map(
              (item) => (
                <DesktopNavigationItem
                  key={item.path}
                  item={item}
                  pathname={pathname}
                />
              )
            )}
          </nav>

          {/* TABLET CURRENT PAGE */}

          <div
            className="
              hidden xl:hidden flex-1 md:flex justify-center items-center
              min-w-0
            "
          >
            <div
              className="
                inline-flex items-center
                min-w-0 max-w-full
                px-3 py-2
                bg-slate-50
                border border-slate-200 rounded-xl
                gap-2
              "
            >
              <CurrentIcon
                size={16}
                className="
                  text-slate-700
                  shrink-0
                "
                aria-hidden="true"
              /
              >

              <span
                className="
                  font-semibold text-slate-700 text-sm truncate
                "
              >
                {currentNavigation.label}
              </span>

              <ChevronDown
                size={14}
                className="
                  text-slate-400
                "
                aria-hidden="true"
              /
              >
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="
              xl:hidden inline-flex justify-center items-center
              w-10 h-10
              text-slate-700
              bg-slate-100 hover:bg-slate-200
              rounded-xl focus:outline-none
              transition
              focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
            "
            aria-expanded={mobileMenuOpen}
            aria-controls="smartsave-mobile-navigation"
            aria-label={
              mobileMenuOpen
                ? "Close SmartSave navigation"
                : "Open SmartSave navigation"
            }
          >
            {mobileMenuOpen ? (
              <X
                size={19}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={19}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {/* MOBILE / TABLET NAVIGATION */}

        {mobileMenuOpen && (
          <div
            id="smartsave-mobile-navigation"
            className="
              xl:hidden
              pb-4
            "
          >
            <div
              className="
                p-2
                bg-slate-50
                border border-slate-200 rounded-2xl
              "
            >
              <div
                className="
                  flex justify-between items-center
                  mb-1 px-3 py-2
                "
              >
                <div>
                  <p
                    className="
                      font-semibold text-slate-900 text-sm
                    "
                  >
                    SmartSave
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-slate-500 text-xs
                    "
                  >
                    Navigate your savings workspace
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseMobileMenu}
                  className="
                    flex justify-center items-center
                    w-8 h-8
                    text-slate-500 hover:text-slate-900
                    hover:bg-white
                    rounded-lg focus:outline-none
                    transition
                    focus-visible:ring-2 focus-visible:ring-slate-400
                  "
                  aria-label="Close navigation"
                >
                  <X
                    size={16}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <nav
                className="
                  flex flex-col
                  gap-1
                "
                aria-label="SmartSave mobile navigation"
              >
                {SMART_SAVE_NAVIGATION.map(
                  (item) => (
                    <MobileNavigationItem
                      key={item.path}
                      item={item}
                      pathname={pathname}
                      onNavigate={
                        handleCloseMobileMenu
                      }
                    />
                  )
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default SmartSaveHeader;