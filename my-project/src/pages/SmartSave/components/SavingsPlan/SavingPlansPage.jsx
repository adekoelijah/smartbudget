
import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";

import useSavingPlans from "../../../../hooks/useSavingPlans";
import useSavingsGoals from "../../../../hooks/useSavingsGoals";

import CreateSavingPlanModal from "./CreateSavingPlanModal";
import SavingPlanDetailsDrawer from "./SavingPlanDetailsDrawer";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_FILTERS = Object.freeze({
  status: "",
  page: 1,
  limit: 12,
});

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All plans",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "paused",
    label: "Paused",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const STATUS_STYLES = {
  draft: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 border-slate-200",
  },

  active: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  paused: {
    label: "Paused",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  completed: {
    label: "Completed",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "bg-rose-50 text-rose-700 border-rose-200",
  },

  expired: {
    label: "Expired",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },
};

/* =========================================================
   VALUE HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const getPlanId = (plan) =>
  plan?._id ??
  plan?.id ??
  plan?.planId ??
  null;

const getGoalId = (goal) =>
  goal?._id ??
  goal?.id ??
  goal?.goalId ??
  null;

const getAccountId = (account) => {
  if (!account) {
    return null;
  }

  if (typeof account === "string") {
    return account;
  }

  return (
    account?._id ??
    account?.id ??
    account?.accountId ??
    null
  );
};

const getGoalAccountId = (goal) =>
  getAccountId(goal?.savingAccount);

const getPlanGoal = (plan) =>
  plan?.goal ??
  plan?.savingGoal ??
  null;



const getPlanGoalName = (plan) => {
  const goal = getPlanGoal(plan);

  if (
    goal &&
    typeof goal === "object"
  ) {
    return (
      goal?.name ??
      goal?.title ??
      "Savings goal"
    );
  }

  return "Savings goal";
};

const getPlanName = (plan) =>
  typeof plan?.name === "string" &&
  plan.name.trim()
    ? plan.name.trim()
    : "Untitled saving plan";

const getPlanCurrency = (plan) => {
  const currency =
    plan?.target?.currency ??
    plan?.currency ??
    "NGN";

  return typeof currency === "string"
    ? currency.toUpperCase()
    : "NGN";
};

const getPlanTargetAmount = (plan) =>
  Math.max(
    0,
    toNumber(
      plan?.target?.amount ??
        plan?.targetAmount,
      0
    )
  );

const getPlanCurrentAmount = (plan) =>
  Math.max(
    0,
    toNumber(
      plan?.progress?.currentAmount ??
        plan?.currentAmount ??
        plan?.metrics?.totalContributed,
      0
    )
  );

const getPlanProgress = (plan) => {
  const backendProgress = toNumber(
    plan?.progress?.percentage ??
      plan?.progressPercentage ??
      plan?.metrics?.progressPercentage,
    NaN
  );

  if (Number.isFinite(backendProgress)) {
    return Math.min(
      100,
      Math.max(0, backendProgress)
    );
  }

  const target =
    getPlanTargetAmount(plan);

  const current =
    getPlanCurrentAmount(plan);

  if (target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (current / target) * 100
    )
  );
};

const getPlanTargetDate = (plan) =>
  plan?.target?.targetDate ??
  plan?.targetDate ??
  null;

const getPlanFrequency = (plan) =>
  plan?.contribution?.frequency ??
  "monthly";

const getPlanContributionAmount = (
  plan
) =>
  Math.max(
    0,
    toNumber(
      plan?.contribution?.amount,
      0
    )
  );

const formatCurrency = (
  amount,
  currency = "NGN"
) => {
  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(
      toNumber(amount)
    );
  } catch {
    return `${currency} ${toNumber(
      amount
    ).toLocaleString()}`;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "No target date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No target date";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

const formatFrequency = (frequency) => {
  if (!frequency) {
    return "Flexible";
  }

  return frequency
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};

const normalizeSearchValue = (
  value
) =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : "";

/* =========================================================
   PRESENTATION COMPONENTS
========================================================= */

const PageSkeleton = () => (
  <div
    className="
      space-y-6
      animate-pulse
    "
  >
    <div
      className="
        w-64 h-10
        bg-slate-200
        rounded-xl
      "
      /
    >

    <div
      className="
        grid sm:grid-cols-2 xl:grid-cols-4
        gap-4
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="
              h-32
              bg-slate-100
              rounded-2xl
            "
            /
          >
        )
      )}
    </div>

    <div
      className="
        h-72
        bg-slate-100
        rounded-3xl
      "
      /
    >
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}) => (
  <div
    className="
      p-8
      bg-rose-50
      border border-rose-200 rounded-3xl
    "
  >
    <div
      className="
        flex flex-col sm:flex-row sm:justify-between sm:items-center
        gap-5
      "
    >
      <div
        className="
          flex
          gap-4
        "
      >
        <div
          className="
            flex justify-center items-center
            w-11 h-11
            text-rose-600
            bg-white
            rounded-2xl
            shadow-sm
            shrink-0
          "
        >
          <AlertCircle size={21} />
        </div>

        <div>
          <h3
            className="
              font-semibold text-slate-900
            "
          >
            We couldn't load your saving plans
          </h3>

          <p
            className="
              max-w-xl
              mt-1
              text-slate-600 text-sm leading-6
            "
          >
            {error?.message ??
              "Something went wrong while loading your saving plans."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="
          inline-flex justify-center items-center
          h-11
          px-5
          font-semibold text-white text-sm
          bg-slate-900 hover:bg-slate-800
          rounded-xl
          transition
          gap-2
        "
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  </div>
);

const EmptyState = ({
  search,
  hasGoals,
  onCreate,
}) => (
  <div
    className="
      px-6 py-14
      text-center
      bg-white
      border border-slate-200 rounded-3xl
      shadow-sm
    "
  >
    <div
      className="
        flex justify-center items-center
        w-16 h-16
        mx-auto
        text-blue-600
        bg-blue-50
        rounded-3xl
      "
    >
      <Target size={28} />
    </div>

    <h3
      className="
        mt-5
        font-bold text-slate-900 text-lg
      "
    >
      {search
        ? "No saving plans found"
        : "Create your first saving plan"}
    </h3>

    <p
      className="
        max-w-lg
        mx-auto mt-2
        text-slate-500 text-sm leading-6
      "
    >
      {search
        ? "Try a different plan name or search term."
        : hasGoals
          ? "Turn one of your existing savings goals into a structured contribution plan."
          : "Create a savings goal first. Your saving plan will then define how you will fund that goal."}
    </p>

    {!search && hasGoals ? (
      <button
        type="button"
        onClick={onCreate}
        className="
          inline-flex items-center
          h-11
          mt-6 px-5
          font-semibold text-white text-sm
          bg-slate-900 hover:bg-slate-800
          rounded-xl
          transition
          gap-2
        "
      >
        <Plus size={17} />
        Create saving plan
      </button>
    ) : null}
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  helper,
}) => (
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
      <div>
        <p
          className="
            font-semibold text-slate-400 text-xs uppercase tracking-[0.08em]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-2
            font-bold text-slate-900 text-2xl tracking-tight
          "
        >
          {value}
        </p>

        {helper ? (
          <p
            className="
              mt-1
              text-slate-500 text-xs
            "
          >
            {helper}
          </p>
        ) : null}
      </div>

      <div
        className="
          flex justify-center items-center
          w-10 h-10
          text-slate-600
          bg-slate-50
          rounded-xl
          shrink-0
        "
      >
        <Icon size={19} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({
  status,
}) => {
  const normalized =
    typeof status === "string"
      ? status.toLowerCase()
      : "draft";

  const configuration =
    STATUS_STYLES[
      normalized
    ] ?? STATUS_STYLES.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${configuration.className}`}
    >
      {configuration.label}
    </span>
  );
};

const ProgressBar = ({
  value,
}) => {
  const progress = Math.min(
    100,
    Math.max(
      0,
      toNumber(value)
    )
  );

  return (
    <div
      className="
        overflow-hidden
        h-2
        bg-slate-100
        rounded-full
      "
    >
      <div
        className="
          h-full
          bg-slate-900
          rounded-full
          transition-[width] duration-500
        "
        style={{
          width: `${progress}%`,
        }}
      /
      >
    </div>
  );
};

const PlanCard = ({
  plan,
  onOpen,
}) => {
  const target =
    getPlanTargetAmount(plan);

  const current =
    getPlanCurrentAmount(plan);

  const progress =
    getPlanProgress(plan);

  const currency =
    getPlanCurrency(plan);

  const status =
    plan?.status ?? "draft";

  return (
    <article
      className="
        overflow-hidden
        bg-white
        border border-slate-200 hover:border-slate-300 rounded-3xl
        shadow-sm hover:shadow-md transition
        group hover:-translate-y-0.5
      "
    >
      <div
        className="
          p-5 sm:p-6
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
              min-w-0
            "
          >
            <div
              className="
                flex flex-wrap items-center
                gap-2
              "
            >
              <StatusBadge status={status} />

              {plan?.automation?.enabled ? (
                <span
                  className="
                    inline-flex items-center
                    px-2.5 py-1
                    font-semibold text-[11px] text-blue-700
                    bg-blue-50
                    border border-blue-200 rounded-full
                  "
                >
                  Automated
                </span>
              ) : null}
            </div>

            <h3
              className="
                mt-3
                font-bold text-slate-900 text-lg truncate
              "
            >
              {getPlanName(plan)}
            </h3>

            <div
              className="
                flex items-center
                min-w-0
                mt-2
                text-slate-500 text-sm
                gap-2
              "
            >
              <Target
                size={15}
                className="
                  shrink-0
                "
                /
              >

              <span
                className="
                  truncate
                "
              >
                {getPlanGoalName(
                  plan
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpen(plan)
            }
            className="flex justify-center items-center hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl w-10 h-10 text-slate-500 hover:text-slate-900 transition shrink-0"
            aria-label={`Open ${getPlanName(
              plan
            )}`}
          >
            <ArrowRight
              size={17}
            />
          </button>
        </div>

        <div
          className="
            mt-6
          "
        >
          <div
            className="
              flex justify-between items-end
              gap-4
            "
          >
            <div>
              <p
                className="
                  font-medium text-slate-400 text-xs
                "
              >
                Progress
              </p>

              <p
                className="
                  mt-1
                  font-semibold text-slate-900 text-sm
                "
              >
                {formatCurrency(
                  current,
                  currency
                )}{" "}
                <span
                  className="
                    font-normal text-slate-400
                  "
                >
                  of{" "}
                  {formatCurrency(
                    target,
                    currency
                  )}
                </span>
              </p>
            </div>

            <span
              className="
                font-bold text-slate-900 text-sm
              "
            >
              {Math.round(
                progress
              )}
              %
            </span>
          </div>

          <div
            className="
              mt-3
            "
          >
            <ProgressBar
              value={progress}
            />
          </div>
        </div>

        <div
          className="
            grid grid-cols-2
            mt-6
            gap-3
          "
        >
          <div
            className="
              p-3
              bg-slate-50
              rounded-2xl
            "
          >
            <p
              className="
                font-medium text-[11px] text-slate-400
              "
            >
              Contribution
            </p>

            <p
              className="
                mt-1
                font-semibold text-slate-900 text-sm
              "
            >
              {getPlanContributionAmount(
                plan
              ) > 0
                ? formatCurrency(
                    getPlanContributionAmount(
                      plan
                    ),
                    currency
                  )
                : "Flexible"}
            </p>
          </div>

          <div
            className="
              p-3
              bg-slate-50
              rounded-2xl
            "
          >
            <p
              className="
                font-medium text-[11px] text-slate-400
              "
            >
              Frequency
            </p>

            <p
              className="
                mt-1
                font-semibold text-slate-900 text-sm capitalize
              "
            >
              {formatFrequency(
                getPlanFrequency(
                  plan
                )
              )}
            </p>
          </div>
        </div>

        <div
          className="
            flex justify-between items-center
            mt-4 pt-4
            text-slate-500 text-xs
            border-slate-100 border-t
          "
        >
          <span
            className="
              inline-flex items-center
              gap-1.5
            "
          >
            <CalendarDays size={14} />
            {formatDate(
              getPlanTargetDate(
                plan
              )
            )}
          </span>

          <span>
            {plan?.planType
              ?.replace(
                /_/g,
                " "
              ) ?? "Fixed amount"}
          </span>
        </div>
      </div>
    </article>
  );
};

const GoalConnectionPanel = ({
  goals,
  selectedGoal,
  onSelect,
}) => {
  return (
    <div
      className="
        p-5 sm:p-6
        bg-gradient-to-br from-blue-50 via-white to-white
        border border-blue-100 rounded-3xl
      "
    >
      <div
        className="
          flex items-start
          gap-4
        "
      >
        <div
          className="
            flex justify-center items-center
            w-11 h-11
            text-white
            bg-blue-600
            rounded-2xl
            shadow-sm
            shrink-0
          "
        >
          <Target size={20} />
        </div>

        <div>
          <h3
            className="
              font-bold text-slate-900
            "
          >
            Connect this plan to a goal
          </h3>

          <p
            className="
              max-w-2xl
              mt-1
              text-slate-500 text-sm leading-6
            "
          >
            Every saving plan belongs to a real savings goal.
            Select the goal you want this plan to fund.
          </p>
        </div>
      </div>

      <div
        className="
          mt-5
        "
      >
        <label
          htmlFor="saving-plan-goal"
          className="
            font-semibold text-slate-500 text-xs uppercase tracking-[0.08em]
          "
        >
          Savings goal
        </label>

        <select
          id="saving-plan-goal"
          value={
            getGoalId(
              selectedGoal
            ) ?? ""
          }
          onChange={(event) => {
            const nextGoal =
              goals.find(
                (goal) =>
                  getGoalId(
                    goal
                  ) ===
                  event.target
                    .value
              ) ?? null;

            onSelect(
              nextGoal
            );
          }}
          className="bg-white mt-2 px-4 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 w-full h-12 font-medium text-slate-900 text-sm transition"
        >
          <option value="">
            Select a savings goal
          </option>

          {goals.map(
            (goal) => (
              <option
                key={
                  getGoalId(
                    goal
                  )
                }
                value={
                  getGoalId(
                    goal
                  ) ?? ""
                }
              >
                {goal.name} —{" "}
                {formatCurrency(
                  goal.targetAmount,
                  goal.currency
                )}
              </option>
            )
          )}
        </select>
      </div>

      {selectedGoal ? (
        <div
          className="
            grid sm:grid-cols-3
            mt-4
            gap-3
          "
        >
          <div
            className="
              p-4
              bg-white
              border border-blue-100 rounded-2xl
            "
          >
            <p
              className="
                font-semibold text-[11px] text-slate-400 uppercase
                tracking-[0.08em]
              "
            >
              Target
            </p>

            <p
              className="
                mt-1
                font-bold text-slate-900
              "
            >
              {formatCurrency(
                selectedGoal.targetAmount,
                selectedGoal.currency
              )}
            </p>
          </div>

          <div
            className="
              p-4
              bg-white
              border border-blue-100 rounded-2xl
            "
          >
            <p
              className="
                font-semibold text-[11px] text-slate-400 uppercase
                tracking-[0.08em]
              "
            >
              Saved
            </p>

            <p
              className="
                mt-1
                font-bold text-slate-900
              "
            >
              {formatCurrency(
                selectedGoal.currentAmount,
                selectedGoal.currency
              )}
            </p>
          </div>

          <div
            className="
              p-4
              bg-white
              border border-blue-100 rounded-2xl
            "
          >
            <p
              className="
                font-semibold text-[11px] text-slate-400 uppercase
                tracking-[0.08em]
              "
            >
              Goal date
            </p>

            <p
              className="
                mt-1
                font-bold text-slate-900
              "
            >
              {formatDate(
                selectedGoal.targetDate
              )}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/* =========================================================
   PAGE
========================================================= */

const SavingPlansPage = () => {
  const {
    plans,
    pagination,
    loading,
    refreshing,
    error,
    createPlan,
    refresh,
    setStatus,
    goToPage,
    pausePlan,
    resumePlan,
    activatePlan,
    deletePlan,
  } = useSavingPlans({
    initialFilters:
      DEFAULT_FILTERS,
    autoFetch: true,
  });

  const {
    activeGoals,
    loading: goalsLoading,
  
    refresh: refreshGoals,
  } = useSavingsGoals({
    status: "active",
    page: 1,
    limit: 100,
  });

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    selectedGoal,
    setSelectedGoal,
  ] = useState(null);

  const [
    selectedPlan,
    setSelectedPlan,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState(null);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const visiblePlans = useMemo(() => {
    const normalizedSearch =
      normalizeSearchValue(
        search
      );

    if (!normalizedSearch) {
      return plans;
    }

    return plans.filter(
      (plan) => {
        const name =
          normalizeSearchValue(
            getPlanName(plan)
          );

        const goalName =
          normalizeSearchValue(
            getPlanGoalName(plan)
          );

        return (
          name.includes(
            normalizedSearch
          ) ||
          goalName.includes(
            normalizedSearch
          )
        );
      }
    );
  }, [plans, search]);

  const planSummary = useMemo(() => {
    const totalPlans =
      pagination?.total ??
      plans.length;

    const activeCount =
      plans.filter(
        (plan) =>
          plan?.status ===
          "active"
      ).length;

    const completedCount =
      plans.filter(
        (plan) =>
          plan?.status ===
          "completed"
      ).length;

    const totalTarget =
      plans.reduce(
        (sum, plan) =>
          sum +
          getPlanTargetAmount(
            plan
          ),
        0
      );

    const totalCurrent =
      plans.reduce(
        (sum, plan) =>
          sum +
          getPlanCurrentAmount(
            plan
          ),
        0
      );

    return {
      totalPlans,
      activeCount,
      completedCount,
      totalTarget,
      totalCurrent,
    };
  }, [plans, pagination]);

  const availableGoals = useMemo(
    () =>
      activeGoals.filter(
        (goal) =>
          Boolean(
            getGoalId(
              goal
            )
          )
      ),
    [activeGoals]
  );

  /* =======================================================
     CREATE FLOW
  ======================================================= */

  const handleOpenCreate =
    useCallback(() => {
      setActionError(null);

      const firstAvailableGoal =
        availableGoals[0] ??
        null;

      setSelectedGoal(
        firstAvailableGoal
      );

      setCreateOpen(true);
    }, [availableGoals]);

  const handleCloseCreate =
    useCallback(() => {
      setCreateOpen(false);
      setSelectedGoal(null);
      setActionError(null);
    }, []);

  const handleCreate =
    useCallback(
      async (payload) => {
        setActionError(null);

        const goalId =
          getGoalId(
            selectedGoal
          );

        const savingAccountId =
          getGoalAccountId(
            selectedGoal
          );

        if (!goalId) {
          const message =
            "Select a valid savings goal before creating a saving plan.";

          setActionError(
            message
          );

          throw new Error(
            message
          );
        }

        if (!savingAccountId) {
          const message =
            "This savings goal is not connected to a saving account yet. Connect an account to the goal before creating a plan.";

          setActionError(
            message
          );

          throw new Error(
            message
          );
        }

        const planPayload = {
          ...payload,

          goal: goalId,

          savingAccount:
            savingAccountId,
        };

        const result =
          await createPlan(
            planPayload
          );

        handleCloseCreate();

        return result;
      },
      [
        selectedGoal,
        createPlan,
        handleCloseCreate,
      ]
    );

  /* =======================================================
     PLAN ACTIONS
  ======================================================= */

  const handleOpenPlan =
    useCallback((plan) => {
      setActionError(null);
      setSelectedPlan(plan);
    }, []);

  const handleClosePlan =
    useCallback(() => {
      setSelectedPlan(null);
    }, []);

  const handlePausePlan =
    useCallback(
      async (planId) => {
        try {
          setActionError(null);

          await pausePlan(
            planId
          );

          setSelectedPlan(
            null
          );
        } catch (requestError) {
          setActionError(
            requestError?.message ??
              "Unable to pause saving plan."
          );
        }
      },
      [pausePlan]
    );

  const handleResumePlan =
    useCallback(
      async (planId) => {
        try {
          setActionError(null);

          await resumePlan(
            planId
          );

          setSelectedPlan(
            null
          );
        } catch (requestError) {
          setActionError(
            requestError?.message ??
              "Unable to resume saving plan."
          );
        }
      },
      [resumePlan]
    );

  const handleActivatePlan =
    useCallback(
      async (planId) => {
        try {
          setActionError(null);

          await activatePlan(
            planId
          );

          setSelectedPlan(
            null
          );
        } catch (requestError) {
          setActionError(
            requestError?.message ??
              "Unable to activate saving plan."
          );
        }
      },
      [activatePlan]
    );

  const handleDeletePlan =
    useCallback(
      async (planId) => {
        try {
          setActionError(null);

          await deletePlan(
            planId
          );

          setSelectedPlan(
            null
          );
        } catch (requestError) {
          setActionError(
            requestError?.message ??
              "Unable to delete saving plan."
          );
        }
      },
      [deletePlan]
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    plans.length === 0
  ) {
    return (
      <main
        className="
          min-h-full
          p-4 sm:p-6 lg:p-8
          bg-slate-50
        "
      >
        <PageSkeleton />
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="
        min-h-full
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-[1600px]
          mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className="
            p-5 sm:p-7
            bg-white
            border border-slate-200 rounded-3xl
            shadow-sm
          "
        >
          <div
            className="
              flex flex-col xl:flex-row xl:justify-between xl:items-center
              gap-6
            "
          >
            <div
              className="
                max-w-3xl
              "
            >
              <div
                className="
                  inline-flex items-center
                  px-3 py-1.5
                  font-semibold text-blue-700 text-xs
                  bg-blue-50
                  border border-blue-100 rounded-full
                  gap-2
                "
              >
                <TrendingUp
                  size={14}
                />
                SmartSave Plans
              </div>

              <h1
                className="
                  mt-4
                  font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight
                "
              >
                Turn your goals into a saving system
              </h1>

              <p
                className="
                  max-w-2xl
                  mt-2
                  text-slate-500 text-sm sm:text-base leading-6
                "
              >
                A saving plan defines how you will fund an
                existing goal — including your contribution
                strategy, frequency, target date and
                automation.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleOpenCreate
              }
              disabled={
                goalsLoading ||
                availableGoals.length ===
                  0
              }
              className="
                inline-flex justify-center items-center
                h-12
                px-5
                font-semibold text-white text-sm
                bg-slate-950 hover:bg-slate-800
                rounded-xl
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2 shrink-0
              "
            >
              <Plus size={18} />
              Create saving plan
            </button>
          </div>
        </section>

        {/* =================================================
            ACTION ERROR
        ================================================= */}

        {actionError ? (
          <div
            className="
              flex items-start
              mt-5 p-4
              text-rose-700 text-sm
              bg-rose-50
              border border-rose-200 rounded-2xl
              gap-3
            "
          >
            <AlertCircle
              size={18}
              className="
                mt-0.5
                shrink-0
              "
              /
            >

            <div
              className="
                flex-1
              "
            >
              {actionError}
            </div>

            <button
              type="button"
              onClick={() =>
                setActionError(
                  null
                )
              }
              className="text-rose-500 hover:text-rose-700 shrink-0"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}

        {/* =================================================
            STATS
        ================================================= */}

        <section
          className="
            grid sm:grid-cols-2 xl:grid-cols-4
            mt-5
            gap-4
          "
        >
          <StatCard
            icon={WalletCards}
            label="Total plans"
            value={
              planSummary.totalPlans
            }
            helper="Across your saving system"
          />

          <StatCard
            icon={Clock3}
            label="Active plans"
            value={
              planSummary.activeCount
            }
            helper="Currently contributing"
          />

          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={
              planSummary.completedCount
            }
            helper="Plans that reached their target"
          />

          <StatCard
            icon={CircleDollarSign}
            label="Plan targets"
            value={formatCurrency(
              planSummary.totalTarget
            )}
            helper={`${formatCurrency(
              planSummary.totalCurrent
            )} currently saved`}
          />
        </section>

        {/* =================================================
            GOAL CONNECTION INFO
        ================================================= */}

        <section
          className="
            mt-5 p-5 sm:p-6
            bg-white
            border border-slate-200 rounded-3xl
            shadow-sm
          "
        >
          <div
            className="
              flex flex-col lg:flex-row lg:justify-between lg:items-center
              gap-4
            "
          >
            <div
              className="
                flex
                gap-4
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-11 h-11
                  text-white
                  bg-slate-950
                  rounded-2xl
                  shrink-0
                "
              >
                <Target size={20} />
              </div>

              <div>
                <h2
                  className="
                    font-bold text-slate-900
                  "
                >
                  Your plans are connected to your goals
                </h2>

                <p
                  className="
                    max-w-2xl
                    mt-1
                    text-slate-500 text-sm leading-6
                  "
                >
                  SmartSave keeps the goal as the source of
                  truth for the target amount, currency and
                  target date. Plans determine the strategy
                  used to reach that goal.
                </p>
              </div>
            </div>

            <div
              className="
                flex items-center
                px-4 py-3
                font-medium text-slate-600 text-sm
                bg-slate-50
                rounded-xl
                gap-2 shrink-0
              "
            >
              <Target
                size={16}
                className="
                  text-blue-600
                "
                /
              >

              {availableGoals.length} active{" "}
              {availableGoals.length ===
              1
                ? "goal"
                : "goals"}{" "}
              available
            </div>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section
          className="
            mt-6
          "
        >
          <div
            className="
              flex flex-col lg:flex-row lg:justify-between lg:items-center
              gap-3
            "
          >
            <div
              className="
                relative flex-1
                min-w-0 lg:max-w-md
              "
            >
              <Search
                size={17}
                className="
                  top-1/2 left-4 absolute
                  text-slate-400
                  pointer-events-none
                  -translate-y-1/2
                "
                /
              >

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search plans or goals..."
                className="bg-white pr-4 pl-11 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 w-full h-11 text-slate-900 placeholder:text-slate-400 text-sm transition"
              />
            </div>

            <div
              className="
                flex items-center overflow-x-auto
                pb-1
                gap-2
              "
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <button
                    key={
                      option.value ||
                      "all"
                    }
                    type="button"
                    onClick={() =>
                      setStatus(
                        option.value
                      )
                    }
                    className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                      (pagination?.filters?.status ??
                        "") ===
                      option.value
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {
                      option.label
                    }
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => {
                  void refresh();
                  void refreshGoals();
                }}
                disabled={
                  refreshing
                }
                className="inline-flex justify-center items-center bg-white disabled:opacity-50 border border-slate-200 hover:border-slate-300 rounded-xl w-10 h-10 text-slate-500 hover:text-slate-900 transition shrink-0"
                aria-label="Refresh saving plans"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <section
            className="
              mt-5
            "
          >
            <ErrorState
              error={error}
              onRetry={() => {
                void refresh();
              }}
            />
          </section>
        ) : null}

        {/* =================================================
            PLANS
        ================================================= */}

        {!error ? (
          <section
            className="
              mt-5
            "
          >
            {visiblePlans.length >
            0 ? (
              <div
                className="
                  grid md:grid-cols-2 xl:grid-cols-3
                  gap-4
                "
              >
                {visiblePlans.map(
                  (plan) => (
                    <PlanCard
                      key={
                        getPlanId(
                          plan
                        )
                      }
                      plan={
                        plan
                      }
                      onOpen={
                        handleOpenPlan
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState
                search={search}
                hasGoals={
                  availableGoals.length >
                  0
                }
                onCreate={
                  handleOpenCreate
                }
              />
            )}
          </section>
        ) : null}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {pagination &&
        pagination.totalPages >
          1 ? (
          <section
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              mt-6 p-4
              bg-white
              border border-slate-200 rounded-2xl
              gap-3
            "
          >
            <p
              className="
                text-slate-500 text-sm
              "
            >
              Page{" "}
              <span
                className="
                  font-semibold text-slate-900
                "
              >
                {pagination.page}
              </span>{" "}
              of{" "}
              <span
                className="
                  font-semibold text-slate-900
                "
              >
                {
                  pagination.totalPages
                }
              </span>
            </p>

            <div
              className="
                flex items-center
                gap-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  goToPage(
                    Math.max(
                      1,
                      pagination.page -
                        1
                    )
                  )
                }
                disabled={
                  !pagination.hasPreviousPage
                }
                className="inline-flex items-center gap-2 bg-white disabled:opacity-40 px-3 border border-slate-200 hover:border-slate-300 rounded-xl h-10 font-semibold text-slate-600 text-sm transition disabled:cursor-not-allowed"
              >
                <ChevronLeft
                  size={16}
                />
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  goToPage(
                    pagination.page +
                      1
                  )
                }
                disabled={
                  !pagination.hasNextPage
                }
                className="inline-flex items-center gap-2 bg-white disabled:opacity-40 px-3 border border-slate-200 hover:border-slate-300 rounded-xl h-10 font-semibold text-slate-600 text-sm transition disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight
                  size={16}
                />
              </button>
            </div>
          </section>
        ) : null}
      </div>

      {/* ===================================================
          CREATE PLAN MODAL
      =================================================== */}

      {createOpen ? (
        <CreateSavingPlanModal
          open={createOpen}
          onClose={
            handleCloseCreate
          }
          onSubmit={
            handleCreate
          }
          submitting={
            loading
          }
          selectedGoal={
            selectedGoal
          }
          goals={
            availableGoals
          }
          onGoalChange={
            setSelectedGoal
          }
        />
      ) : null}

      {/* ===================================================
          PLAN DETAILS
      =================================================== */}

      {selectedPlan ? (
        <SavingPlanDetailsDrawer
          open={Boolean(
            selectedPlan
          )}
          plan={
            selectedPlan
          }
          onClose={
            handleClosePlan
          }
          onPause={
            handlePausePlan
          }
          onResume={
            handleResumePlan
          }
          onActivate={
            handleActivatePlan
          }
          onDelete={
            handleDeletePlan
          }
        />
      ) : null}
    </main>
  );
};

export default SavingPlansPage;
