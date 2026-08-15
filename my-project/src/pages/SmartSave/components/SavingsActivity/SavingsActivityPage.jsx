import {
  Activity,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import useSmartSave from "../../../../hooks/useSmartSave";

import {
  DEFAULT_CURRENCY,
} from "../../../../constants/smartSaveConstants";

import SavingsActivitySection from "./SavingsActivitySection";

import SavingsSkeleton from "../shared/SavingsSkeleton";
import SavingsErrorState from "../shared/SavingsErrorState";

/* =========================================================
   SAFE OBJECT RESOLVER
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

/* =========================================================
   SMARTSAVE RESPONSE RESOLVER
========================================================= */

const resolveData = (data) => {
  if (!isObject(data)) {
    return {};
  }

  if (isObject(data.data)) {
    return data.data;
  }

  if (isObject(data.result)) {
    return data.result;
  }

  return data;
};

/* =========================================================
   ACTIVITY RESOLVER
========================================================= */

const resolveActivity = (data) => {
  const activity =
    data.activity ??
    data.activities ??
    data.savingsActivity;

  return Array.isArray(activity)
    ? activity
    : [];
};

/* =========================================================
   PAGE
========================================================= */

const SavingsActivityPage = () => {
  const smartSave = useSmartSave();

  const {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
  } = smartSave ?? {};

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const savingsData = resolveData(data);

  const activity = resolveActivity(
    savingsData
  );

  const currency =
    DEFAULT_CURRENCY ?? "NGN";

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleRefresh = async () => {
    if (typeof refresh !== "function") {
      return;
    }

    try {
      await refresh();
    } catch {
      /*
       * Refresh errors remain owned by
       * useSmartSave.
       */
    }
  };

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (loading && !data) {
    return (
      <main
        className="
          w-full min-h-screen
          bg-slate-50
        "
        aria-busy="true"
        aria-label="Loading savings activity"
      >
        <div
          className="
            w-full max-w-7xl
            mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8
          "
        >
          <SavingsSkeleton module="page" />
        </div>
      </main>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (error && !data) {
    return (
      <main
        className="
          w-full min-h-screen
          bg-slate-50
        "
      >
        <div
          className="
            flex items-center
            w-full max-w-7xl min-h-screen
            mx-auto px-4 sm:px-6 lg:px-8 py-8
          "
        >
          <div
            className="
              w-full
            "
          >
            <SavingsErrorState
              error={error}
              onRetry={handleRefresh}
            />
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const hasActivity = activity.length > 0;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className="
        w-full min-h-screen
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8
        "
      >
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            gap-4
          "
        >
          <div
            className="
              flex items-start
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-11 h-11
                bg-slate-900
                rounded-xl
                shadow-sm
                shrink-0
              "
              aria-hidden="true"
            >
              <Activity
                size={20}
                className="
                  text-white
                "
                /
              >
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-semibold text-slate-500 text-xs uppercase tracking-wide
                "
              >
                SmartSave
              </p>

              <h1
                className="
                  mt-1
                  font-bold text-slate-900 text-xl sm:text-2xl tracking-tight
                "
              >
                Savings Activity
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-1
                  text-slate-500 text-sm leading-6
                "
              >
                Keep track of your recent savings
                activity, contributions, progress,
                and important changes across
                SmartSave.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              isRefreshing ||
              typeof refresh !== "function"
            }
            className="
              inline-flex justify-center items-center
              w-full sm:w-auto
              px-4 py-2.5
              font-semibold text-slate-700 text-sm
              bg-white hover:bg-slate-100
              border border-slate-200 rounded-xl focus:outline-none
              focus:ring-2 focus:ring-slate-300
              disabled:opacity-50 shadow-sm transition
              disabled:cursor-not-allowed
              gap-2
            "
            aria-label="Refresh savings activity"
          >
            <RefreshCw
              size={15}
              className={
                isRefreshing
                  ? "animate-spin"
                  : ""
              }
              aria-hidden="true"
            />

            {isRefreshing
              ? "Updating..."
              : "Refresh"}
          </button>
        </header>

        {/* =================================================
            REFRESH STATUS
        ================================================= */}

        {isRefreshing && (
          <div
            className="
              flex items-center
              mt-4 px-4 py-2.5
              font-medium text-slate-500 text-xs
              bg-white
              border border-slate-200 rounded-xl
              shadow-sm
              gap-2
            "
            role="status"
            aria-live="polite"
          >
            <RefreshCw
              size={13}
              className="
                animate-spin
              "
              aria-hidden="true"
            /
            >

            Updating your savings activity...
          </div>
        )}

        {/* =================================================
            PARTIAL ERROR
        ================================================= */}

        {error && data && (
          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              mt-4 p-4
              bg-amber-50
              border border-amber-200 rounded-xl
              gap-3
            "
            role="alert"
          >
            <div
              className="
                flex items-start
                min-w-0
                gap-3
              "
            >
              <AlertTriangle
                size={17}
                className="
                  mt-0.5
                  text-amber-600
                  shrink-0
                "
                aria-hidden="true"
              /
              >

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    font-semibold text-amber-900 text-sm
                  "
                >
                  Activity data may be out of date.
                </p>

                <p
                  className="
                    mt-0.5
                    text-amber-700 text-xs leading-5
                  "
                >
                  Your previously loaded activity
                  remains available.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="
                inline-flex justify-center items-center
                w-full sm:w-auto
                px-3 py-2
                font-semibold text-amber-800 text-xs
                bg-white hover:bg-amber-100
                border border-amber-200 rounded-lg
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
                gap-2 shrink-0
              "
            >
              <RefreshCw
                size={13}
                className={
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }
                aria-hidden="true"
              />

              Retry
            </button>
          </div>
        )}

        {/* =================================================
            ACTIVITY SUMMARY
        ================================================= */}

        <section
          className="
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
            mt-6 sm:mt-8
            gap-4
          "
          aria-label="Savings activity summary"
        >
          <div
            className="
              p-5
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
          >
            <p
              className="
                font-medium text-slate-500 text-xs uppercase tracking-wide
              "
            >
              Activity records
            </p>

            <p
              className="
                mt-2
                font-bold text-slate-900 text-2xl
              "
            >
              {activity.length}
            </p>

            <p
              className="
                mt-1
                text-slate-500 text-xs leading-5
              "
            >
              Savings events currently available
              in your SmartSave activity feed.
            </p>
          </div>

          <div
            className="
              p-5
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
          >
            <p
              className="
                font-medium text-slate-500 text-xs uppercase tracking-wide
              "
            >
              Module
            </p>

            <p
              className="
                mt-2
                font-bold text-slate-900 text-2xl
              "
            >
              SmartSave
            </p>

            <p
              className="
                mt-1
                text-slate-500 text-xs leading-5
              "
            >
              Activity across your savings goals,
              contributions, and progress.
            </p>
          </div>

          <div
            className="
              p-5
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
          >
            <p
              className="
                font-medium text-slate-500 text-xs uppercase tracking-wide
              "
            >
              Currency
            </p>

            <p
              className="
                mt-2
                font-bold text-slate-900 text-2xl
              "
            >
              {currency}
            </p>

            <p
              className="
                mt-1
                text-slate-500 text-xs leading-5
              "
            >
              Your SmartSave financial display
              currency.
            </p>
          </div>
        </section>

        {/* =================================================
            EMPTY ACTIVITY
        ================================================= */}

        {!hasActivity && (
          <section
            className="
              mt-6 p-6 sm:p-8
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
            aria-labelledby="activity-empty-title"
          >
            <div
              className="
                flex flex-col items-center
                max-w-xl
                mx-auto
                text-center
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-14 h-14
                  bg-slate-100
                  rounded-2xl
                "
                aria-hidden="true"
              >
                <Activity
                  size={25}
                  className="
                    text-slate-700
                  "
                  /
                >
              </div>

              <h2
                id="activity-empty-title"
                className="
                  mt-5
                  font-bold text-slate-900 text-lg sm:text-xl tracking-tight
                "
              >
                No savings activity yet
              </h2>

              <p
                className="
                  mt-2
                  text-slate-500 text-sm leading-6
                "
              >
                Your SmartSave activity will appear
                here as you create goals, make
                contributions, complete savings
                actions, and progress through your
                savings journey.
              </p>
            </div>
          </section>
        )}

        {/* =================================================
            ACTIVITY CONTENT
        ================================================= */}

        {hasActivity && (
          <section
            className="
              mt-6 sm:mt-8
            "
            aria-labelledby="savings-activity-heading"
          >
            <div
              className="
                flex flex-col sm:flex-row sm:justify-between sm:items-end
                mb-4
                gap-3
              "
            >
              <div>
                <h2
                  id="savings-activity-heading"
                  className="
                    font-bold text-slate-900 text-lg
                  "
                >
                  Recent activity
                </h2>

                <p
                  className="
                    mt-1
                    text-slate-500 text-sm
                  "
                >
                  A connected view of your latest
                  SmartSave events.
                </p>
              </div>

              <span
                className="
                  inline-flex items-center
                  w-fit
                  px-2.5 py-1
                  font-semibold text-slate-600 text-xs
                  bg-slate-100
                  rounded-full
                "
              >
                {activity.length}{" "}
                {activity.length === 1
                  ? "record"
                  : "records"}
              </span>
            </div>

            <SavingsActivitySection
              activity={activity}
            />
          </section>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            mt-8 sm:mt-10 pt-5
            border-slate-200 border-t
          "
        >
          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              text-slate-400 text-xs
              gap-2
            "
          >
            <p>
              SmartSave keeps your savings activity
              connected and easy to review.
            </p>

            <p
              className="
                font-medium
              "
            >
              Currency: {currency}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default SavingsActivityPage;