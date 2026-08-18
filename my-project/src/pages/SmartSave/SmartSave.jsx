import {
  Activity,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
  Zap,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useSmartSave from "../../hooks/useSmartSave";

import SmartSaveHeader from "../SmartSave/components/SmartSaveHeader";

import SavingsHealthScore from "../SmartSave/components/SavingsHealthScore";
import SafeToSaveCard from "../SmartSave/components/SafeToSaveCard";


import SavingsEmptyState from "../SmartSave/components/shared/SavingsEmptyState";
import SavingsSkeleton from "../SmartSave/components/shared/SavingsSkeleton";
import SavingsErrorState from "../SmartSave/components/shared/SavingsErrorState";

import {
  DEFAULT_CURRENCY,
} from "../../constants/smartSaveConstants";

/* =========================================================
   CONSTANTS
========================================================= */

const SMART_SAVE_ROUTES = {
  OVERVIEW: "/app/smartsave",
  GOALS: "/app/smartsave/goals",
  ACTIVITY: "/app/smartsave/activity",
  CHALLENGES: "/app/smartsave/challenges",
  FORECAST: "/app/smartsave/forecast",
  INSIGHTS: "/app/smartsave/insights",
  STRATEGIES: "/app/smartsave/strategies",
};

const QUICK_ACCESS_ITEMS = [
  {
    label: "Savings goals",
    description: "Track what you're building toward.",
    path: SMART_SAVE_ROUTES.GOALS,
    icon: Target,
  },
  {
    label: "Savings activity",
    description: "Review your latest saving activity.",
    path: SMART_SAVE_ROUTES.ACTIVITY,
    icon: Activity,
  },
  {
    label: "Challenges",
    description: "Build stronger saving habits.",
    path: SMART_SAVE_ROUTES.CHALLENGES,
    icon: Trophy,
  },
  {
    label: "Forecast",
    description: "See where your savings are heading.",
    path: SMART_SAVE_ROUTES.FORECAST,
    icon: TrendingUp,
  },
  {
    label: "Insights",
    description: "Understand your savings patterns.",
    path: SMART_SAVE_ROUTES.INSIGHTS,
    icon: Lightbulb,
  },
  {
    label: "Strategies",
    description: "Manage how you save.",
    path: SMART_SAVE_ROUTES.STRATEGIES,
    icon: Zap,
  },
];

/* =========================================================
   SAFE DATA HELPERS
========================================================= */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

const resolveData = (value) => {
  if (!isObject(value)) {
    return {};
  }

  if (isObject(value.data)) {
    return value.data;
  }

  if (isObject(value.result)) {
    return value.result;
  }

  return value;
};

const resolveGoals = (data) =>
  toArray(
    data.goals ??
      data.savingsGoals
  );

const resolveChallenges = (data) =>
  toArray(
    data.challenges ??
      data.savingsChallenges
  );

const resolveActivity = (data) =>
  toArray(
    data.activity ??
      data.activities ??
      data.savingsActivity
  );

const resolveInsights = (data) =>
  toArray(
    data.insights ??
      data.savingsInsights
  );

const resolveStrategies = (data) =>
  toArray(
    data.strategies ??
      data.savingStrategies
  );

const resolveForecast = (data) =>
  data.forecast ??
  data.savingsForecast ??
  null;

const resolveHealth = (data) =>
  data.health ??
  data.savingsHealth ??
  data.healthScore ??
  null;

const resolveSafeToSave = (data) =>
  data.safeToSave ??
  data.safeToSaveResult ??
  null;

const resolveEmergencyFund = (data) =>
  data.emergencyFund ??
  data.emergencyFundStatus ??
  null;

/* =========================================================
   ID / LABEL HELPERS
========================================================= */

const getItemId = (item) =>
  item?._id ??
  item?.id ??
  item?.goalId ??
  item?.challengeId ??
  item?.strategyId ??
  null;

const getGoalProgress = (goal) => {
  const explicitProgress =
    Number(
      goal?.progressPercentage ??
        goal?.progress ??
        goal?.percentage ??
        NaN
    );

  if (
    Number.isFinite(
      explicitProgress
    )
  ) {
    return Math.min(
      100,
      Math.max(
        0,
        explicitProgress
      )
    );
  }

  const currentAmount =
    Number(
      goal?.currentAmount ??
        goal?.savedAmount ??
        goal?.amountSaved ??
        0
    );

  const targetAmount =
    Number(
      goal?.targetAmount ??
        goal?.target ??
        goal?.amount ??
        0
    );

  if (
    targetAmount <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (currentAmount /
        targetAmount) *
        100
    )
  );
};

const getGoalName = (goal) =>
  goal?.name ??
  goal?.title ??
  goal?.goalName ??
  "Savings goal";

const getActivityDescription = (
  activity
) =>
  activity?.description ??
  activity?.title ??
  activity?.name ??
  activity?.type ??
  "Savings activity";

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  description,
  to,
}) => {
  const content = (
    <div
      className="
        h-full
        p-4 sm:p-5
        bg-white
        border border-slate-200 hover:border-slate-300 rounded-2xl
        shadow-sm transition
      "
    >
      <div
        className="
          flex justify-between items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <Icon
            size={18}
            strokeWidth={2}
          />
        </div>

        {to && (
          <ArrowRight
            size={15}
            className="
              text-slate-400
            "
            aria-hidden="true"
          /
          >
        )}
      </div>

      <p
        className="
          mt-4
          font-medium text-slate-500 text-xs
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          font-bold text-slate-900 text-xl tracking-tight
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-slate-500 text-xs leading-5
        "
      >
        {description}
      </p>
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link
      to={to}
      className="
        block
        h-full
        rounded-2xl focus:outline-none
        focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
      "
    >
      {content}
    </Link>
  );
};

/* =========================================================
   GOAL PROGRESS CARD
========================================================= */

const GoalProgressCard = ({
  goal,
  onOpen,
}) => {
  const progress =
    getGoalProgress(
      goal
    );

  const goalName =
    getGoalName(
      goal
    );

  const goalId =
    getItemId(
      goal
    );

  const handleOpen = () => {
    if (
      typeof onOpen !==
      "function"
    ) {
      return;
    }

    onOpen(
      goalId
    );
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="
        w-full
        p-4
        text-left
        bg-white
        border border-slate-200 hover:border-slate-300 rounded-2xl
        focus:outline-none
        shadow-sm transition
        focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
      "
    >
      <div
        className="
          flex justify-between items-center
          gap-3
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-slate-900 text-sm truncate
            "
          >
            {goalName}
          </p>

          <p
            className="
              mt-1
              text-slate-500 text-xs
            "
          >
            {progress.toFixed(0)}% complete
          </p>
        </div>

        <span
          className="
            font-bold text-slate-700 text-sm
            shrink-0
          "
        >
          {progress.toFixed(0)}%
        </span>
      </div>

      <div
        className="
          overflow-hidden
          h-2
          mt-4
          bg-slate-100
          rounded-full
        "
        aria-hidden="true"
      >
        <div
          className="
            h-full
            bg-slate-900
            rounded-full
            transition-all
          "
          style={{
            width: `${progress}%`,
          }}
        /
        >
      </div>
    </button>
  );
};

/* =========================================================
   ACTIVITY PREVIEW
========================================================= */

const ActivityPreview = ({
  activity,
}) => {
  if (
    activity.length ===
    0
  ) {
    return (
      <div
        className="
          flex flex-col justify-center
          min-h-48
          p-5
          bg-white
          border border-slate-200 rounded-2xl
          shadow-sm
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            bg-slate-100
            rounded-xl
          "
        >
          <Activity
            size={18}
            className="
              text-slate-700
            "
            aria-hidden="true"
          /
          >
        </div>

        <h3
          className="
            mt-4
            font-semibold text-slate-900 text-sm
          "
        >
          No savings activity yet
        </h3>

        <p
          className="
            mt-1
            text-slate-500 text-xs leading-5
          "
        >
          Your latest savings activity will appear
          here as you build your savings.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        bg-white
        border border-slate-200 rounded-2xl
        shadow-sm
      "
    >
      <div
        className="
          p-5
          border-slate-100 border-b
        "
      >
        <div
          className="
            flex justify-between items-center
            gap-3
          "
        >
          <div>
            <h3
              className="
                font-semibold text-slate-900 text-sm
              "
            >
              Recent activity
            </h3>

            <p
              className="
                mt-1
                text-slate-500 text-xs
              "
            >
              Your latest savings movements.
            </p>
          </div>

          <Link
            to={SMART_SAVE_ROUTES.ACTIVITY}
            className="
              inline-flex items-center
              font-semibold text-slate-700 hover:text-slate-900 text-xs
              gap-1
            "
          >
            View all
            <ArrowRight
              size={13}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      <div>
        {activity
          .slice(0, 4)
          .map(
            (
              item,
              index
            ) => {
              const itemId =
                getItemId(
                  item
                );

              const key =
                itemId
                  ? `activity-${String(
                      itemId
                    )}`
                  : `activity-${index}`;

              return (
                <div
                  key={key}
                  className="
                    flex items-center
                    px-5 py-4
                    border-slate-100 border-b last:border-b-0
                    gap-3
                  "
                >
                  <div
                    className="
                      flex justify-center items-center
                      w-9 h-9
                      bg-slate-100
                      rounded-lg
                      shrink-0
                    "
                  >
                    <WalletCards
                      size={16}
                      className="
                        text-slate-700
                      "
                      aria-hidden="true"
                    /
                    >
                  </div>

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >
                    <p
                      className="
                        font-medium text-slate-800 text-xs truncate
                      "
                    >
                      {getActivityDescription(
                        item
                      )}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[11px] text-slate-400
                      "
                    >
                      Savings activity
                    </p>
                  </div>
                </div>
              );
            }
          )}
      </div>
    </div>
  );
};

/* =========================================================
   QUICK ACCESS
========================================================= */

const QuickAccess = () => (
  <section
    aria-labelledby="smart-save-quick-access"
  >
    <div
      className="
        flex justify-between items-end
        mb-4
        gap-4
      "
    >
      <div>
        <p
          className="
            font-semibold text-slate-500 text-xs uppercase tracking-wide
          "
        >
          Workspace
        </p>

        <h2
          id="smart-save-quick-access"
          className="
            mt-1
            font-bold text-slate-900 text-lg tracking-tight
          "
        >
          Explore SmartSave
        </h2>
      </div>
    </div>

    <div
      className="
        grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
        gap-3
      "
    >
      {QUICK_ACCESS_ITEMS.map(
        (item) => {
          const Icon =
            item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="
                flex items-center
                p-4
                bg-white
                border border-slate-200 hover:border-slate-300 rounded-xl
                focus:outline-none
                shadow-sm transition
                group gap-3
                focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-10 h-10
                  text-slate-700
                  bg-slate-100
                  rounded-xl
                  shrink-0
                "
              >
                <Icon
                  size={17}
                  aria-hidden="true"
                />
              </div>

              <div
                className="
                  flex-1
                  min-w-0
                "
              >
                <p
                  className="
                    font-semibold text-slate-800 text-sm
                  "
                >
                  {item.label}
                </p>

                <p
                  className="
                    mt-0.5
                    text-slate-500 text-xs leading-5
                  "
                >
                  {item.description}
                </p>
              </div>

              <ArrowRight
                size={15}
                className="
                  text-slate-400
                  transition
                  group-hover:text-slate-700 shrink-0
                "
                aria-hidden="true"
              /
              >
            </Link>
          );
        }
      )}
    </div>
  </section>
);

/* =========================================================
   MAIN PAGE
========================================================= */

const SmartSaveOverviewPage = () => {
  const navigate =
    useNavigate();

  const smartSave =
    useSmartSave();

  const {
    data,
    loading = false,
    error = null,
    refresh,
    isRefreshing = false,
  } = smartSave ?? {};

  const currency =
    DEFAULT_CURRENCY ??
    "NGN";

  const savingsData =
    resolveData(
      data
    );

  const goals =
    resolveGoals(
      savingsData
    );

  const challenges =
    resolveChallenges(
      savingsData
    );

  const activity =
    resolveActivity(
      savingsData
    );

  const insights =
    resolveInsights(
      savingsData
    );

  const strategies =
    resolveStrategies(
      savingsData
    );

  const forecast =
    resolveForecast(
      savingsData
    );

  const health =
    resolveHealth(
      savingsData
    );

  const safeToSave =
    resolveSafeToSave(
      savingsData
    );

  const emergencyFund =
    resolveEmergencyFund(
      savingsData
    );

  const hasSavingsContent =
    goals.length > 0 ||
    challenges.length > 0 ||
    activity.length > 0 ||
    insights.length > 0 ||
    strategies.length > 0 ||
    Boolean(forecast) ||
    Boolean(health) ||
    Boolean(safeToSave) ||
    Boolean(emergencyFund);

  const handleRefresh =
    async () => {
      if (
        typeof refresh !==
        "function"
      ) {
        return;
      }

      try {
        await refresh();
      } catch {
        // Hook remains the source of truth.
      }
    };

  const handleCreateGoal =
    () => {
      navigate(
        SMART_SAVE_ROUTES.GOALS
      );
    };

  const handleOpenGoal =
    () => {
      navigate(
        SMART_SAVE_ROUTES.GOALS
      );
    };

  if (
    loading &&
    !data
  ) {
    return (
      <main
        className="
          w-full min-h-screen
          bg-slate-50
        "
        aria-busy="true"
        aria-label="Loading SmartSave"
      >
        <SmartSaveHeader />

        <div
          className="
            w-full max-w-7xl
            mx-auto px-4 sm:px-6 lg:px-8 py-6
          "
        >
          <SavingsSkeleton
            module="page"
          />
        </div>
      </main>
    );
  }

  if (
    error &&
    !data
  ) {
    return (
      <main
        className="
          w-full min-h-screen
          bg-slate-50
        "
      >
        <SmartSaveHeader />

        <div
          className="
            flex items-center
            w-full max-w-7xl min-h-[70vh]
            mx-auto px-4 sm:px-6 lg:px-8
          "
        >
          <div
            className="
              w-full
            "
          >
            <SavingsErrorState
              error={error}
              onRetry={
                handleRefresh
              }
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        w-full min-h-screen
        bg-slate-50
      "
    >
      <SmartSaveHeader />

      <div
        className="
          w-full max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8
        "
      >
        {/* =================================================
            REFRESH STATUS
        ================================================= */}

        {isRefreshing && (
          <div
            className="
              flex items-center
              mb-4 px-4 py-2.5
              font-medium text-slate-500 text-xs
              bg-white
              border border-slate-200 rounded-xl
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

            Updating your SmartSave data...
          </div>
        )}

        {/* =================================================
            WELCOME / COMMAND STRIP
        ================================================= */}

        <section
          className="
            relative overflow-hidden
            p-5 sm:p-7
            bg-slate-900
            rounded-2xl
            shadow-sm
          "
        >
          <div
            className="
              flex flex-col lg:flex-row lg:justify-between lg:items-center
              gap-6
            "
          >
            <div
              className="
                max-w-2xl
              "
            >
              <div
                className="
                  inline-flex items-center
                  px-2.5 py-1.5
                  font-semibold text-[11px] text-slate-200
                  bg-white/10
                  border border-white/10 rounded-lg
                  gap-2
                "
              >
                <Zap
                  size={13}
                  aria-hidden="true"
                />

                SMARTSAVE OVERVIEW
              </div>

              <h1
                className="
                  mt-4
                  font-bold text-white text-2xl sm:text-3xl tracking-tight
                "
              >
                Your savings, at a glance.
              </h1>

              <p
                className="
                  max-w-xl
                  mt-2
                  text-slate-300 text-sm leading-6
                "
              >
                See your progress, understand your
                financial position, and move quickly to
                the part of SmartSave you need.
              </p>
            </div>

            <div
              className="
                flex flex-wrap items-center
                gap-2
              "
            >
              <Link
                to={SMART_SAVE_ROUTES.GOALS}
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2.5
                  font-semibold text-slate-900 text-sm
                  bg-white hover:bg-slate-100
                  rounded-xl
                  transition
                  gap-2
                "
              >
                <Target
                  size={16}
                  aria-hidden="true"
                />

                View goals
              </Link>

              <Link
                to={
                  SMART_SAVE_ROUTES.INSIGHTS
                }
                className="
                  inline-flex justify-center items-center
                  min-h-10
                  px-4 py-2.5
                  font-semibold text-white text-sm
                  bg-white/10 hover:bg-white/15
                  border border-white/10 rounded-xl
                  transition
                  gap-2
                "
              >
                <Lightbulb
                  size={16}
                  aria-hidden="true"
                />

                Insights
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            PARTIAL DATA WARNING
        ================================================= */}

        {error &&
          data && (
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
              <div>
                <p
                  className="
                    font-semibold text-amber-900 text-sm
                  "
                >
                  Some SmartSave data could not be
                  updated.
                </p>

                <p
                  className="
                    mt-1
                    text-amber-700 text-xs
                  "
                >
                  Your previously loaded information
                  remains available.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  isRefreshing
                }
                className="
                  inline-flex justify-center items-center
                  min-h-9
                  px-3 py-2
                  font-semibold text-amber-800 text-xs
                  bg-white hover:bg-amber-100
                  border border-amber-200 rounded-lg
                  disabled:opacity-50
                  gap-2
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
            EMPTY WORKSPACE
        ================================================= */}

        {!hasSavingsContent && (
          <section
            className="
              mt-6
            "
          >
            <SavingsEmptyState
              title="Your SmartSave workspace is ready"
              description="Create your first savings goal and start building a smarter savings plan."
              actionLabel="Explore savings goals"
              onAction={
                handleCreateGoal
              }
            />
          </section>
        )}

        {/* =================================================
            AT A GLANCE
        ================================================= */}

        {hasSavingsContent && (
          <>
            <section
              className="
                mt-6
              "
              aria-labelledby="smart-save-at-a-glance"
            >
              <div
                className="
                  mb-4
                "
              >
                <p
                  className="
                    font-semibold text-slate-500 text-xs uppercase tracking-wide
                  "
                >
                  Financial position
                </p>

                <h2
                  id="smart-save-at-a-glance"
                  className="
                    mt-1
                    font-bold text-slate-900 text-lg tracking-tight
                  "
                >
                  At a glance
                </h2>
              </div>

              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
                  gap-4
                "
              >
                <SummaryCard
                  icon={Target}
                  label="Active goals"
                  value={
                    goals.length
                  }
                  description="Savings targets you're currently building."
                  to={
                    SMART_SAVE_ROUTES.GOALS
                  }
                />

                <SummaryCard
                  icon={Activity}
                  label="Recent activity"
                  value={
                    activity.length
                  }
                  description="Recorded savings activity in your workspace."
                  to={
                    SMART_SAVE_ROUTES.ACTIVITY
                  }
                />

                <SummaryCard
                  icon={Trophy}
                  label="Challenges"
                  value={
                    challenges.length
                  }
                  description="Savings challenges available in your workspace."
                  to={
                    SMART_SAVE_ROUTES.CHALLENGES
                  }
                />

                <SummaryCard
                  icon={Zap}
                  label="Strategies"
                  value={
                    strategies.length
                  }
                  description="Saving strategies currently available to you."
                  to={
                    SMART_SAVE_ROUTES.STRATEGIES
                  }
                />
              </div>
            </section>

            {/* =============================================
                PRIMARY PROGRESS
            ============================================= */}

            <section
              className="
                mt-8
              "
              aria-labelledby="smart-save-progress"
            >
              <div
                className="
                  mb-4
                "
              >
                <p
                  className="
                    font-semibold text-slate-500 text-xs uppercase tracking-wide
                  "
                >
                  Progress
                </p>

                <h2
                  id="smart-save-progress"
                  className="
                    mt-1
                    font-bold text-slate-900 text-lg tracking-tight
                  "
                >
                  What you're building
                </h2>
              </div>

              <div
                className="
                  grid grid-cols-1 lg:grid-cols-2
                  gap-4
                "
              >
                <div
                  className="
                    p-5
                    bg-slate-900
                    rounded-2xl
                    shadow-sm
                  "
                >
                  <div
                    className="
                      flex justify-between items-center
                      gap-3
                    "
                  >
                    <div>
                      <p
                        className="
                          font-semibold text-slate-300 text-xs uppercase
                          tracking-wide
                        "
                      >
                        Savings goals
                      </p>

                      <h3
                        className="
                          mt-1
                          font-bold text-white text-lg
                        "
                      >
                        Goal progress
                      </h3>
                    </div>

                    <Link
                      to={
                        SMART_SAVE_ROUTES.GOALS
                      }
                      className="
                        inline-flex items-center
                        font-semibold text-slate-300 hover:text-white text-xs
                        gap-1
                      "
                    >
                      View all
                      <ArrowRight
                        size={13}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>

                  <div
                    className="
                      grid grid-cols-1 sm:grid-cols-2
                      mt-5
                      gap-3
                    "
                  >
                    {goals
                      .slice(0, 2)
                      .map(
                        (
                          goal,
                          index
                        ) => {
                          const goalId =
                            getItemId(
                              goal
                            );

                          const key =
                            goalId
                              ? `goal-${String(
                                  goalId
                                )}`
                              : `goal-${index}`;

                          return (
                            <div
                              key={key}
                              className="
                                [&>button]:bg-white [&>button]:border-slate-200
                              "
                            >
                              <GoalProgressCard
                                goal={goal}
                                onOpen={
                                  handleOpenGoal
                                }
                              />
                            </div>
                          );
                        }
                      )}

                    {goals.length ===
                      0 && (
                      <div
                        className="
                          p-5
                          bg-white/10
                          border border-white/10 rounded-xl
                          sm:col-span-2
                        "
                      >
                        <p
                          className="
                            font-semibold text-white text-sm
                          "
                        >
                          No savings goals yet
                        </p>

                        <p
                          className="
                            mt-1
                            text-slate-300 text-xs leading-5
                          "
                        >
                          Create your first goal to
                          start tracking progress.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {emergencyFund && (
                  <div
                    className="
                      overflow-hidden
                      bg-white
                      border border-slate-200 rounded-2xl
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        flex justify-between items-start
                        p-5
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex items-start
                          gap-3
                        "
                      >
                        <div
                          className="
                            flex justify-center items-center
                            w-10 h-10
                            bg-slate-100
                            rounded-xl
                            shrink-0
                          "
                        >
                          <WalletCards
                            size={18}
                            className="
                              text-slate-700
                            "
                            aria-hidden="true"
                          /
                          >
                        </div>

                        <div>
                          <p
                            className="
                              font-semibold text-slate-500 text-xs uppercase
                              tracking-wide
                            "
                          >
                            Safety net
                          </p>

                          <h3
                            className="
                              mt-1
                              font-bold text-slate-900 text-lg
                            "
                          >
                            Emergency fund
                          </h3>

                          <p
                            className="
                              mt-1
                              text-slate-500 text-xs leading-5
                            "
                          >
                            Your emergency savings
                            position.
                          </p>
                        </div>
                      </div>

                      <Link
                        to={
                          "/app/smartsave/emergency-fund"
                        }
                        className="
                          inline-flex items-center
                          font-semibold
                          text-slate-600 hover:text-slate-900 text-xs
                          gap-1 shrink-0
                        "
                      >
                        Details
                        <ArrowRight
                          size={13}
                          aria-hidden="true"
                        />
                      </Link>
                    </div>

                    <div
                      className="
                        px-5 pb-5
                      "
                    >
                      <div
                        className="
                          p-4
                          bg-slate-50
                          rounded-xl
                        "
                      >
                        <p
                          className="
                            text-slate-600 text-xs leading-5
                          "
                        >
                          Your emergency fund data is
                          available. Open the dedicated
                          page for detailed coverage,
                          progress and recommendations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =============================================
                INTELLIGENCE
            ============================================= */}

            {(health ||
              safeToSave ||
              forecast) && (
              <section
                className="
                  mt-8
                "
                aria-labelledby="smart-save-intelligence"
              >
                <div
                  className="
                    mb-4
                  "
                >
                  <p
                    className="
                      font-semibold text-slate-500 text-xs uppercase
                      tracking-wide
                    "
                  >
                    Intelligence
                  </p>

                  <h2
                    id="smart-save-intelligence"
                    className="
                      mt-1
                      font-bold text-slate-900 text-lg tracking-tight
                    "
                  >
                    Know before you save
                  </h2>

                  <p
                    className="
                      max-w-2xl
                      mt-1
                      text-slate-500 text-sm leading-6
                    "
                  >
                    SmartSave turns your savings data
                    into signals that help you make
                    better decisions.
                  </p>
                </div>

                <div
                  className="
                    grid grid-cols-1 xl:grid-cols-2
                    gap-4
                  "
                >
                  {health && (
                    <SavingsHealthScore
                      data={health}
                      currency={
                        currency
                      }
                    />
                  )}

                  {safeToSave && (
                    <SafeToSaveCard
                      result={
                        safeToSave
                      }
                      currency={
                        currency
                      }
                    />
                  )}

                  {forecast && (
  <Link
    to={SMART_SAVE_ROUTES.FORECAST}
    className="
      block
      p-5
      bg-white
      border border-slate-200 hover:border-slate-300 rounded-2xl
      focus:outline-none
      shadow-sm transition
      group
      focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
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
          flex items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
          aria-hidden="true"
        >
          <TrendingUp
            size={18}
          />
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
            Savings forecast
          </p>

          <h3
            className="
              mt-1
              font-bold text-slate-900 text-lg
            "
          >
            See where your savings are heading
          </h3>

          <p
            className="
              max-w-xl
              mt-1
              text-slate-500 text-xs leading-5
            "
          >
            Explore your projected savings,
            timelines, milestones and future
            financial position.
          </p>
        </div>
      </div>

      <ArrowRight
        size={17}
        className="
          mt-1
          text-slate-400
          transition
          group-hover:text-slate-700 group-hover:translate-x-0.5 shrink-0
        "
        aria-hidden="true"
      /
      >
    </div>

    <div
      className="
        flex justify-between items-center
        mt-5 pt-4
        border-slate-100 border-t
      "
    >
      <span
        className="
          font-medium text-slate-500 text-xs
        "
      >
        Open forecast
      </span>

      <span
        className="
          font-semibold text-slate-700 text-xs
        "
      >
        View details
      </span>
    </div>
  </Link>
)}
                </div>
              </section>
            )}

            {/* =============================================
                ACTIVITY + INSIGHT
            ============================================= */}

            <section
              className="
                grid grid-cols-1 xl:grid-cols-2
                mt-8
                gap-4
              "
            >
              <ActivityPreview
                activity={
                  activity
                }
              />

              <div
                className="
                  p-5
                  bg-white
                  border border-slate-200 rounded-2xl
                  shadow-sm
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
                      flex items-start
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex justify-center items-center
                        w-10 h-10
                        bg-slate-100
                        rounded-xl
                        shrink-0
                      "
                    >
                      <Lightbulb
                        size={18}
                        className="
                          text-slate-700
                        "
                        aria-hidden="true"
                      /
                      >
                    </div>

                    <div>
                      <h3
                        className="
                          font-semibold text-slate-900 text-sm
                        "
                      >
                        Savings intelligence
                      </h3>

                      <p
                        className="
                          mt-1
                          text-slate-500 text-xs leading-5
                        "
                      >
                        Personalized signals from your
                        savings data.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={
                      SMART_SAVE_ROUTES.INSIGHTS
                    }
                    className="
                      inline-flex items-center
                      font-semibold text-slate-600 hover:text-slate-900 text-xs
                      gap-1
                    "
                  >
                    View all
                    <ArrowRight
                      size={13}
                      aria-hidden="true"
                    />
                  </Link>
                </div>

                {insights.length >
                0 ? (
                  <div
                    className="
                      mt-5 p-4
                      bg-slate-50
                      rounded-xl
                    "
                  >
                    <p
                      className="
                        font-semibold text-slate-800 text-sm
                      "
                    >
                      {insights[0]?.title ??
                        insights[0]?.headline ??
                        "New savings insight available"}
                    </p>

                    <p
                      className="
                        mt-1
                        text-slate-500 text-xs leading-5
                      "
                    >
                      {insights[0]?.description ??
                        insights[0]?.message ??
                        "Review your latest SmartSave insights to understand your savings position."}
                    </p>
                  </div>
                ) : (
                  <div
                    className="
                      mt-5 p-4
                      bg-slate-50
                      rounded-xl
                    "
                  >
                    <p
                      className="
                        text-slate-500 text-xs leading-5
                      "
                    >
                      Your savings insights will appear
                      here as SmartSave gathers enough
                      information about your activity.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* =============================================
                QUICK ACCESS
            ============================================= */}

            <div
              className="
                mt-8
              "
            >
              <QuickAccess />
            </div>
          </>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            mt-10 pt-5
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
              SmartSave keeps your goals, progress,
              activity and financial intelligence
              connected.
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

export default SmartSaveOverviewPage;