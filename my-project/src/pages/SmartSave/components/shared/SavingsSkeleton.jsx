
import {
  CircleDollarSign,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  SMART_SAVE_MODULES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SAFE NORMALIZATION
========================================================= */

const normalizeText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

/* =========================================================
   MODULE TYPES
========================================================= */

const MODULES = {
  GOALS:
    SMART_SAVE_MODULES?.GOALS ??
    "goals",

  CHALLENGES:
    SMART_SAVE_MODULES?.CHALLENGES ??
    "challenges",

  INSIGHTS:
    SMART_SAVE_MODULES?.INSIGHTS ??
    "insights",

  STRATEGIES:
    SMART_SAVE_MODULES?.STRATEGIES ??
    "strategies",

  ACTIVITY:
    SMART_SAVE_MODULES?.ACTIVITY ??
    "activity",

  FORECAST:
    SMART_SAVE_MODULES?.FORECAST ??
    "forecast",

  ACCOUNTS:
    SMART_SAVE_MODULES?.ACCOUNTS ??
    "accounts",

  GENERAL:
    "general",
};

/* =========================================================
   ICON RESOLUTION
========================================================= */

const MODULE_ICONS = {
  goals: Target,

  challenges: Trophy,

  insights: TrendingUp,

  strategies: TrendingUp,

  activity: CircleDollarSign,

  forecast: TrendingUp,

  accounts: CircleDollarSign,

  general: CircleDollarSign,
};

// const getModuleIcon = (
//   module
// ) =>
//   MODULE_ICONS[
//     normalizeText(module)
//   ] ??
//   MODULE_ICONS.general;

/* =========================================================
   SKELETON BLOCK
========================================================= */

const SkeletonBlock = ({
  className = "",
}) => (
  <div
    aria-hidden="true"
    className={`
      animate-pulse
      rounded-lg
      bg-slate-200
      ${className}
    `}
  />
);

/* =========================================================
   SKELETON ICON
========================================================= */

const SkeletonIcon = ({
  size = "md",
}) => {
  const dimensions = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      aria-hidden="true"
      className={`
        flex
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-slate-200
        animate-pulse
        ${dimensions[size] ?? dimensions.md}
      `}
    />
  );
};

/* =========================================================
   SKELETON TEXT
========================================================= */

const SkeletonText = ({
  width = "w-full",
  height = "h-3",
  className = "",
}) => (
  <SkeletonBlock
    className={`
      ${width}
      ${height}
      ${className}
    `}
  />
);

/* =========================================================
   GOAL SKELETON
========================================================= */

const GoalSkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex justify-between items-start
        gap-4
      "
    >
      <div
        className="
          flex items-center
          min-w-0
          gap-3
        "
      >
        <SkeletonIcon />

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <SkeletonText
            width="w-32"
            height="h-4"
          />

          <SkeletonText
            width="w-24"
            height="h-3"
            className="
              mt-2
            "
            /
          >
        </div>
      </div>

      <SkeletonBlock
        className="
          w-16 h-7
          rounded-full
        "
        /
      >
    </div>

    <div
      className="
        mt-5
      "
    >
      <div
        className="
          flex justify-between items-center
          mb-2
          gap-3
        "
      >
        <SkeletonText
          width="w-16"
          height="h-3"
        />

        <SkeletonText
          width="w-10"
          height="h-3"
        />
      </div>

      <SkeletonBlock
        className="
          w-full h-2.5
          rounded-full
        "
        /
      >
    </div>

    <div
      className="
        flex justify-between items-center
        mt-4
        gap-4
      "
    >
      <SkeletonText
        width="w-24"
        height="h-3"
      />

      <SkeletonText
        width="w-28"
        height="h-3"
      />
    </div>
  </div>
);

/* =========================================================
   CHALLENGE SKELETON
========================================================= */

const ChallengeSkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex items-start
        gap-3
      "
    >
      <SkeletonIcon />

      <div
        className="
          flex-1
          min-w-0
        "
      >
        <SkeletonText
          width="w-36"
          height="h-4"
        />

        <SkeletonText
          width="w-28"
          height="h-3"
          className="
            mt-2
          "
          /
        >
      </div>
    </div>

    <div
      className="
        grid grid-cols-2
        mt-5
        gap-3
      "
    >
      <div
        className="
          p-3
          bg-slate-50
          rounded-xl
        "
      >
        <SkeletonText
          width="w-16"
          height="h-3"
        />

        <SkeletonText
          width="w-24"
          height="h-5"
          className="
            mt-2
          "
          /
        >
      </div>

      <div
        className="
          p-3
          bg-slate-50
          rounded-xl
        "
      >
        <SkeletonText
          width="w-16"
          height="h-3"
        />

        <SkeletonText
          width="w-20"
          height="h-5"
          className="
            mt-2
          "
          /
        >
      </div>
    </div>

    <SkeletonBlock
      className="
        w-full h-2
        mt-4
        rounded-full
      "
      /
    >
  </div>
);

/* =========================================================
   INSIGHT SKELETON
========================================================= */

const InsightSkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex items-start
        gap-3
      "
    >
      <SkeletonIcon
        size="sm"
      />

      <div
        className="
          flex-1
          min-w-0
        "
      >
        <div
          className="
            flex justify-between items-center
            gap-3
          "
        >
          <SkeletonText
            width="w-28"
            height="h-4"
          />

          <SkeletonText
            width="w-16"
            height="h-5"
            className="
              rounded-full
            "
            /
          >
        </div>

        <SkeletonText
          width="w-full"
          height="h-3"
          className="
            mt-3
          "
          /
        >

        <SkeletonText
          width="w-4/5"
          height="h-3"
          className="
            mt-2
          "
          /
        >
      </div>
    </div>
  </div>
);

/* =========================================================
   STRATEGY SKELETON
========================================================= */

const StrategySkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex justify-between items-start
        gap-4
      "
    >
      <div
        className="
          flex items-center
          gap-3
        "
      >
        <SkeletonIcon />

        <div>
          <SkeletonText
            width="w-32"
            height="h-4"
          />

          <SkeletonText
            width="w-24"
            height="h-3"
            className="
              mt-2
            "
            /
          >
        </div>
      </div>

      <SkeletonBlock
        className="
          w-14 h-6
          rounded-full
        "
        /
      >
    </div>

    <SkeletonText
      width="w-full"
      height="h-3"
      className="
        mt-5
      "
      /
    >

    <SkeletonText
      width="w-3/4"
      height="h-3"
      className="
        mt-2
      "
      /
    >

    <div
      className="
        flex justify-between items-center
        mt-5
      "
    >
      <SkeletonText
        width="w-24"
        height="h-4"
      />

      <SkeletonText
        width="w-20"
        height="h-9"
        className="
          rounded-lg
        "
        /
      >
    </div>
  </div>
);

/* =========================================================
   ACTIVITY SKELETON
========================================================= */

const ActivitySkeleton = () => (
  <div
    className="
      flex items-center
      px-1 py-4
      border-slate-100 border-b last:border-b-0
      gap-3
    "
  >
    <SkeletonIcon
      size="sm"
    />

    <div
      className="
        flex-1
        min-w-0
      "
    >
      <SkeletonText
        width="w-32"
        height="h-3.5"
      />

      <SkeletonText
        width="w-24"
        height="h-3"
        className="
          mt-2
        "
        /
      >
    </div>

    <div
      className="
        flex flex-col items-end
        gap-2
      "
    >
      <SkeletonText
        width="w-20"
        height="h-3.5"
      />

      <SkeletonText
        width="w-14"
        height="h-3"
      />
    </div>
  </div>
);

/* =========================================================
   FORECAST SKELETON
========================================================= */

const ForecastSkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex justify-between items-start
        gap-4
      "
    >
      <div>
        <SkeletonText
          width="w-32"
          height="h-4"
        />

        <SkeletonText
          width="w-24"
          height="h-3"
          className="
            mt-2
          "
          /
        >
      </div>

      <SkeletonIcon
        size="sm"
      />
    </div>

    <SkeletonBlock
      className="
        w-full h-36
        mt-6
        rounded-xl
      "
      /
    >

    <div
      className="
        grid grid-cols-2
        mt-5
        gap-3
      "
    >
      <div
        className="
          p-3
          bg-slate-50
          rounded-xl
        "
      >
        <SkeletonText
          width="w-16"
          height="h-3"
        />

        <SkeletonText
          width="w-24"
          height="h-5"
          className="
            mt-2
          "
          /
        >
      </div>

      <div
        className="
          p-3
          bg-slate-50
          rounded-xl
        "
      >
        <SkeletonText
          width="w-16"
          height="h-3"
        />

        <SkeletonText
          width="w-20"
          height="h-5"
          className="
            mt-2
          "
          /
        >
      </div>
    </div>
  </div>
);

/* =========================================================
   ACCOUNT SKELETON
========================================================= */

const AccountSkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex items-center
        gap-3
      "
    >
      <SkeletonIcon />

      <div
        className="
          flex-1
        "
      >
        <SkeletonText
          width="w-32"
          height="h-4"
        />

        <SkeletonText
          width="w-24"
          height="h-3"
          className="
            mt-2
          "
          /
        >
      </div>

      <SkeletonText
        width="w-24"
        height="h-5"
      />
    </div>

    <div
      className="
        grid grid-cols-2
        mt-5
        gap-3
      "
    >
      <div
        className="
          h-16
          p-3
          bg-slate-50
          rounded-xl
        "
      >
        <SkeletonText
          width="w-14"
          height="h-3"
        />

        <SkeletonText
          width="w-20"
          height="h-4"
          className="
            mt-2
          "
          /
        >
      </div>

      <div
        className="
          h-16
          p-3
          bg-slate-50
          rounded-xl
        "
      >
        <SkeletonText
          width="w-14"
          height="h-3"
        />

        <SkeletonText
          width="w-20"
          height="h-4"
          className="
            mt-2
          "
          /
        >
      </div>
    </div>
  </div>
);

/* =========================================================
   GENERAL SKELETON
========================================================= */

const GeneralSkeleton = () => (
  <div
    className="
      p-5
      bg-white
      border border-slate-200 rounded-2xl
    "
  >
    <div
      className="
        flex items-start
        gap-3
      "
    >
      <SkeletonIcon />

      <div
        className="
          flex-1
        "
      >
        <SkeletonText
          width="w-32"
          height="h-4"
        />

        <SkeletonText
          width="w-24"
          height="h-3"
          className="
            mt-2
          "
          /
        >
      </div>
    </div>

    <SkeletonText
      width="w-full"
      height="h-3"
      className="
        mt-5
      "
      /
    >

    <SkeletonText
      width="w-4/5"
      height="h-3"
      className="
        mt-2
      "
      /
    >

    <SkeletonBlock
      className="
        w-full h-2
        mt-5
        rounded-full
      "
      /
    >
  </div>
);

/* =========================================================
   SKELETON FACTORY
========================================================= */

const renderSkeleton = (
  module
) => {
  switch (
    normalizeText(module)
  ) {
    case MODULES.GOALS:
      return (
        <GoalSkeleton />
      );

    case MODULES.CHALLENGES:
      return (
        <ChallengeSkeleton />
      );

    case MODULES.INSIGHTS:
      return (
        <InsightSkeleton />
      );

    case MODULES.STRATEGIES:
      return (
        <StrategySkeleton />
      );

    case MODULES.ACTIVITY:
      return (
        <ActivitySkeleton />
      );

    case MODULES.FORECAST:
      return (
        <ForecastSkeleton />
      );

    case MODULES.ACCOUNTS:
      return (
        <AccountSkeleton />
      );

    default:
      return (
        <GeneralSkeleton />
      );
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsSkeleton = ({
  module = MODULES.GENERAL,

  count = 1,

  className = "",

  layout = "stack",

  labelled = true,

  label = "Loading savings data",
}) => {
  /* =======================================================
     SAFE COUNT
  ======================================================= */

  const numericCount =
    Number(count);

  const itemCount =
    Number.isFinite(
      numericCount
    )
      ? Math.min(
          12,
          Math.max(
            1,
            Math.floor(
              numericCount
            )
          )
        )
      : 1;

  /* =======================================================
     LAYOUT
  ======================================================= */

  const layoutClass =
    layout === "grid"
      ? `
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      `
      : layout === "list"
        ? `
          flex
          flex-col
          gap-0
        `
        : `
          flex
          flex-col
          gap-4
        `;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`
        w-full
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={
        labelled
          ? label
          : undefined
      }
    >
      {/* ===================================================
          SCREEN READER MESSAGE
      =================================================== */}

      {labelled && (
        <span
          className="
            sr-only
          "
        >
          {label}
        </span>
      )}

      {/* ===================================================
          SKELETON ITEMS
      =================================================== */}

      <div
        className={layoutClass}
        aria-hidden="true"
      >
        {Array.from(
          {
            length:
              itemCount,
          },
          (_, index) => (
            <div
              key={`${normalizeText(
                module
              ) || "general"}-skeleton-${index}`}
            >
              {renderSkeleton(
                module
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SavingsSkeleton;
