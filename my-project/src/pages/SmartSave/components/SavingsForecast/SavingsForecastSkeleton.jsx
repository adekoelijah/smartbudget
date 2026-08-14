
import { memo } from "react";

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
      bg-slate-200
      rounded-lg
      ${className}
    `}
  />
);

/* =========================================================
   COMPONENT
========================================================= */

const SavingsForecastSkeleton = ({
  className = "",
}) => {
  return (
    <div
      className={`
        w-full
        p-5 sm:p-6
        bg-white
        border border-slate-200
        rounded-2xl
        shadow-sm
        ${className}
      `}
      role="status"
      aria-label="Loading savings forecast"
      aria-busy="true"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex justify-between items-start
          gap-4
        "
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
        <div
          className="
            p-4
            bg-slate-50
            border border-slate-100 rounded-xl
          "
        >
          <SkeletonBlock
            className="
              w-24 h-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-32 h-6
              mt-3
            "
            /
          >
        </div>

        <div
          className="
            p-4
            bg-slate-50
            border border-slate-100 rounded-xl
          "
        >
          <SkeletonBlock
            className="
              w-28 h-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-28 h-6
              mt-3
            "
            /
          >
        </div>

        <div
          className="
            p-4
            bg-slate-50
            border border-slate-100 rounded-xl
          "
        >
          <SkeletonBlock
            className="
              w-24 h-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-36 h-6
              mt-3
            "
            /
          >
        </div>
      </div>

      {/* =================================================
          PROGRESS AREA
      ================================================= */}

      <div
        className="
          mt-6 p-4 sm:p-5
          border border-slate-200 rounded-xl
        "
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
        <div
          className="
            p-4
            border border-slate-200 rounded-xl
          "
        >
          <SkeletonBlock
            className="
              w-28 h-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-36 h-5
              mt-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-full max-w-[220px] h-3
              mt-2
            "
            /
          >
        </div>

        <div
          className="
            p-4
            border border-slate-200 rounded-xl
          "
        >
          <SkeletonBlock
            className="
              w-32 h-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-28 h-5
              mt-3
            "
            /
          >

          <SkeletonBlock
            className="
              w-full max-w-[220px] h-3
              mt-2
            "
            /
          >
        </div>
      </div>

      {/* =================================================
          FOOTER / INSIGHT
      ================================================= */}

      <div
        className="
          flex items-start
          mt-4 p-4
          bg-slate-50
          border border-slate-100 rounded-xl
          gap-3
        "
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
    </div>
  );
};

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsForecastSkeleton
);
