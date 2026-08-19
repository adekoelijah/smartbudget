import { memo } from "react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CLASS_NAME = "";

const cn = (...classes) =>
  classes
    .filter(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0
    )
    .join(" ");

/* =========================================================
   SKELETON BLOCK
========================================================= */

const SkeletonBlock = memo(
  ({
    className = "",
  }) => (
    <div
      aria-hidden="true"
      className={cn(
        "bg-slate-200 rounded-lg animate-pulse",
        className
      )}
    />
  )
);

SkeletonBlock.displayName =
  "SavingsForecastSkeletonBlock";

/* =========================================================
   SUMMARY ITEM
========================================================= */

const SummarySkeleton = ({
  labelWidth,
  valueWidth,
}) => (
  <div
    className="
      p-4
      bg-slate-50
      border border-slate-100 rounded-xl
    "
    aria-hidden="true"
  >
    <SkeletonBlock
      className={`h-3 ${labelWidth}`}
    />

    <SkeletonBlock
      className={`
        h-6
        mt-3
        ${valueWidth}
      `}
    />
  </div>
);

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailSkeleton = ({
  labelWidth,
  valueWidth,
}) => (
  <div
    className="
      p-4
      border border-slate-200 rounded-xl
    "
    aria-hidden="true"
  >
    <SkeletonBlock
      className={`h-3 ${labelWidth}`}
    />

    <SkeletonBlock
      className={`
        h-5
        mt-3
        ${valueWidth}
      `}
    />

    <SkeletonBlock
      className="
        w-full max-w-[220px] h-3
        mt-2
      "
      /
    >
  </div>
);

/* =========================================================
   COMPONENT
========================================================= */

const SavingsForecastSkeleton = ({
  className = DEFAULT_CLASS_NAME,
}) => {
  const safeClassName =
    typeof className === "string"
      ? className.trim()
      : "";

  return (
    <section
      className={cn(
        `bg-white shadow-sm p-5 sm:p-6 border border-slate-200 rounded-2xl w-full`,
        safeClassName
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading savings forecast"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex justify-between items-start
          gap-4
        "
        aria-hidden="true"
      >
        <div
          className="
            flex-1
            min-w-0
          "
        >
          <SkeletonBlock
            className="
              w-40 sm:w-52 h-5
            "
            /
          >

          <SkeletonBlock
            className="
              w-56 sm:w-72 h-3.5
              mt-2
            "
            /
          >
        </div>

        <SkeletonBlock
          className="
            w-9 h-9
            rounded-xl
            shrink-0
          "
          /
        >
      </div>

      {/* =================================================
          FORECAST SUMMARY
      ================================================= */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-3
          mt-6
          gap-3
        "
      >
        <SummarySkeleton
          labelWidth="w-24"
          valueWidth="w-32"
        />

        <SummarySkeleton
          labelWidth="w-28"
          valueWidth="w-28"
        />

        <SummarySkeleton
          labelWidth="w-24"
          valueWidth="w-36"
        />
      </div>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <div
        className="
          mt-6 p-4 sm:p-5
          border border-slate-200 rounded-xl
        "
        aria-hidden="true"
      >
        <div
          className="
            flex justify-between items-center
            gap-4
          "
        >
          <SkeletonBlock
            className="
              w-28 h-3.5
            "
            /
          >

          <SkeletonBlock
            className="
              w-12 h-3.5
            "
            /
          >
        </div>

        <SkeletonBlock
          className="
            w-full h-2.5
            mt-3
            rounded-full
          "
          /
        >

        <div
          className="
            flex justify-between
            mt-3
            gap-4
          "
        >
          <SkeletonBlock
            className="
              w-20 h-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-24 h-3
            "
            /
          >
        </div>
      </div>

      {/* =================================================
          FORECAST DETAILS
      ================================================= */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-2
          mt-4
          gap-4
        "
      >
        <DetailSkeleton
          labelWidth="w-28"
          valueWidth="w-36"
        />

        <DetailSkeleton
          labelWidth="w-32"
          valueWidth="w-28"
        />
      </div>

      {/* =================================================
          INSIGHT
      ================================================= */}

      <div
        className="
          flex items-start
          mt-4 p-4
          bg-slate-50
          border border-slate-100 rounded-xl
          gap-3
        "
        aria-hidden="true"
      >
        <SkeletonBlock
          className="
            w-8 h-8
            rounded-lg
            shrink-0
          "
          /
        >

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <SkeletonBlock
            className="
              w-28 h-3.5
            "
            /
          >

          <SkeletonBlock
            className="
              w-full max-w-lg h-3
              mt-2
            "
            /
          >

          <SkeletonBlock
            className="
              w-4/5 max-w-md h-3
              mt-2
            "
            /
          >
        </div>
      </div>

      {/* =================================================
          SCREEN READER STATUS
      ================================================= */}

      <span
        className="
          sr-only
        "
      >
        Loading savings forecast. Please wait.
      </span>
    </section>
  );
};

SavingsForecastSkeleton.displayName =
  "SavingsForecastSkeleton";

export default memo(
  SavingsForecastSkeleton
);