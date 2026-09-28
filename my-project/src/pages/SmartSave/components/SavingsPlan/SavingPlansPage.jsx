/**
 * SavingPlansPage.jsx
 *
 * SmartSave — Saving Plans
 *
 * Responsibilities:
 * - Display saving plans.
 * - Manage page-level UI state.
 * - Coordinate create/edit/delete/detail interactions.
 * - Coordinate saving-plan lifecycle actions.
 * - Manage search and status filters.
 * - Render loading, error, empty and populated states.
 * - Render pagination.
 *
 * Architecture:
 *
 * SavingPlansPage
 *      ↓
 * useSavingPlans
 *      ↓
 * smartSaveService
 *      ↓
 * SmartSave backend
 *
 * The page does not contain financial business logic.
 */

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import useSavingPlans from "../../../../hooks/useSavingPlans";

import SavingPlanDetailsDrawer from "./SavingPlanDetailsDrawer";
import SavingPlanEmptyState from "./SavingPlanEmptyState";
import SavingPlanList from "./SavingPlanList";
import CreateSavingPlanModal from "./CreateSavingPlanModal";
import EditSavingPlanModal from "./EditSavingPlanModal";
import DeleteSavingPlanDialog from "./DeleteSavingPlanDialog";

import {
  getSavingPlanId,
} from "../../../../utils/smartSave/savingPlanHelpers";

/* ==========================================================================
   CONSTANTS
========================================================================== */

const DEFAULT_FILTERS = Object.freeze({
  page: 1,
  limit: 20,
});

const STATUS_OPTIONS = Object.freeze([
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "in_progress",
    label: "In progress",
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
]);

/* ==========================================================================
   HELPERS
========================================================================== */

const normalizeSearchValue = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getErrorText = (error) => {
  if (!error) {
    return "";
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error.trim();
  }

  if (
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  if (
    typeof error.error === "string" &&
    error.error.trim()
  ) {
    return error.error.trim();
  }

  if (
    typeof error.data?.message === "string" &&
    error.data.message.trim()
  ) {
    return error.data.message.trim();
  }

  return "Something went wrong while processing your saving plans.";
};

const getMutationResultError = (result) => {
  if (
    !result ||
    result.success !== false
  ) {
    return "";
  }

  return getErrorText(result.error);
};

/* ==========================================================================
   ERROR BANNER
========================================================================== */

const PageError = memo(
  ({
    error,
    onRetry,
    onDismiss,
    retrying = false,
  }) => {
    const message = getErrorText(error);

    if (!message) {
      return null;
    }

    return (
      <section
        role="alert"
        aria-live="assertive"
        className="
          overflow-hidden
          mb-6
          bg-red-50
          border border-red-200 rounded-2xl
        "
      >
        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            p-4
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
                w-9 h-9
                text-red-600
                bg-red-100
                rounded-full
                shrink-0
              "
            >
              <AlertCircle
                aria-hidden="true"
                className="
                  w-5 h-5
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
                  font-semibold text-red-900 text-sm
                "
              >
                Unable to load saving plans
              </p>

              <p
                className="
                  mt-1
                  text-red-700 text-sm leading-relaxed
                "
              >
                {message}
              </p>
            </div>
          </div>

          <div
            className="
              flex items-center
              shrink-0 gap-2
            "
          >
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                disabled={retrying}
                className="
                  inline-flex justify-center items-center
                  min-h-9
                  px-3
                  font-semibold text-red-700 text-xs
                  hover:bg-red-100
                  rounded-lg
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                "
              >
                Dismiss
              </button>
            ) : null}

            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="
                  inline-flex justify-center items-center
                  min-h-9
                  px-3
                  font-semibold text-white text-xs
                  bg-red-600 hover:bg-red-700
                  rounded-lg
                  disabled:opacity-60 transition
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <RefreshCw
                  aria-hidden="true"
                  className={[
                    "h-3.5 w-3.5",
                    retrying
                      ? "animate-spin"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />

                {retrying
                  ? "Retrying..."
                  : "Retry"}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }
);

PageError.displayName = "PageError";

/* ==========================================================================
   PAGE HEADER
========================================================================== */

const PageHeader = memo(
  ({
    onCreate,
    onRefresh,
    refreshing,
    disabled,
  }) => {
    return (
      <header
        className="
          mb-6
        "
      >
        <div
          className="
            flex flex-col lg:flex-row lg:justify-between lg:items-end
            gap-5
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                inline-flex items-center
                mb-3 px-3 py-1
                font-bold text-[11px] text-blue-700 uppercase tracking-wider
                bg-blue-50
                border border-blue-100 rounded-full
              "
            >
              SmartSave
            </div>

            <h1
              className="
                font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight
              "
            >
              Saving Plans
            </h1>

            <p
              className="
                max-w-2xl
                mt-2
                text-slate-500 text-sm sm:text-base leading-relaxed
              "
            >
              Create structured saving plans, track your
              progress, and manage your savings journey
              from one place.
            </p>
          </div>

          <div
            className="
              flex flex-col sm:flex-row
              w-full sm:w-auto
              gap-2
            "
          >
            <button
              type="button"
              onClick={onRefresh}
              disabled={disabled || refreshing}
              className="
                inline-flex justify-center items-center
                min-h-11
                px-4
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-50
                border border-slate-200 hover:border-slate-300 rounded-xl
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <RefreshCw
                aria-hidden="true"
                className={[
                  "h-4 w-4",
                  refreshing
                    ? "animate-spin"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={onCreate}
              disabled={disabled}
              className="
                inline-flex justify-center items-center
                min-h-11
                px-5
                font-semibold text-white text-sm
                bg-slate-950 hover:bg-slate-800
                rounded-xl
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <Plus
                aria-hidden="true"
                className="
                  w-4 h-4
                "
                /
              >

              Create saving plan
            </button>
          </div>
        </div>
      </header>
    );
  }
);

PageHeader.displayName = "PageHeader";

/* ==========================================================================
   FILTER BAR
========================================================================== */

const FilterBar = memo(
  ({
    search,
    status,
    onSearchChange,
    onStatusChange,
    onApply,
    onClear,
    disabled,
    hasActiveFilters,
  }) => {
    return (
      <section
        aria-label="Saving plan filters"
        className="
          mb-6 p-4
          bg-white
          border border-slate-200 rounded-2xl
          shadow-sm
        "
      >
        <div
          className="
            flex justify-between items-center
            mb-3
            gap-3
          "
        >
          <div
            className="
              flex items-center
              gap-2
            "
          >
            <div
              className="
                flex justify-center items-center
                w-8 h-8
                text-slate-600
                bg-slate-100
                rounded-lg
              "
            >
              <Filter
                aria-hidden="true"
                className="
                  w-4 h-4
                "
                /
              >
            </div>

            <div>
              <p
                className="
                  font-semibold text-slate-900 text-sm
                "
              >
                Filter plans
              </p>

              <p
                className="
                  text-slate-500 text-xs
                "
              >
                Search or narrow plans by status.
              </p>
            </div>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="
                inline-flex items-center
                px-2.5 py-1.5
                font-semibold text-slate-500 hover:text-slate-800 text-xs
                hover:bg-slate-100
                rounded-lg
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
                gap-1.5
              "
            >
              <X
                aria-hidden="true"
                className="
                  w-3.5 h-3.5
                "
                /
              >
              Clear
            </button>
          ) : null}
        </div>

        <div
          className="
            grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px_auto]
            gap-3
          "
        >
          <div
            className="
              relative
            "
          >
            <Search
              aria-hidden="true"
              className="
                top-1/2 left-3 absolute
                w-4 h-4
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
                onSearchChange(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onApply();
                }
              }}
              placeholder="Search saving plans..."
              disabled={disabled}
              aria-label="Search saving plans"
              className="
                bg-slate-50
                focus:bg-white
                disabled:opacity-60
                pr-10 pl-9
                border border-slate-200
                focus:border-blue-400
                rounded-xl
                outline-none
                focus:ring-2
                focus:ring-blue-100
                w-full h-11
                text-slate-900
                placeholder:text-slate-400
                text-sm
                transition
                disabled:cursor-not-allowed
              "
            />

            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                disabled={disabled}
                aria-label="Clear search text"
                className="
                  top-1/2
                  right-2
                  absolute
                  flex
                  justify-center
                  items-center
                  hover:bg-slate-200
                  disabled:opacity-50
                  rounded-lg
                  w-7 h-7
                  text-slate-400
                  hover:text-slate-700
                  transition
                  -translate-y-1/2
                  disabled:cursor-not-allowed
                "
              >
                <X
                  aria-hidden="true"
                  className="
                    w-4 h-4
                  "
                  /
                >
              </button>
            ) : null}
          </div>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value)
            }
            disabled={disabled}
            aria-label="Filter by status"
            className="
              bg-slate-50
              focus:bg-white
              disabled:opacity-60
              px-3
              border border-slate-200
              focus:border-blue-400
              rounded-xl
              outline-none
              focus:ring-2
              focus:ring-blue-100
              w-full h-11
              font-medium
              text-slate-700
              text-sm
              transition
              disabled:cursor-not-allowed
            "
          >
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onApply}
            disabled={disabled}
            className="
              inline-flex justify-center items-center
              h-11
              px-5
              font-semibold text-white text-sm
              bg-slate-950 hover:bg-slate-800
              rounded-xl
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
            "
          >
            Apply filters
          </button>
        </div>
      </section>
    );
  }
);

FilterBar.displayName = "FilterBar";

/* ==========================================================================
   SUMMARY
========================================================================== */

const PlansSummary = memo(
  ({
    totalPlans,
    loading,
  }) => {
    return (
      <div
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          mb-4
          gap-2
        "
      >
        <div>
          <h2
            className="
              font-bold text-slate-900 text-sm
            "
          >
            Your saving plans
          </h2>

          <p
            className="
              mt-0.5
              text-slate-500 text-xs
            "
          >
            {totalPlans}{" "}
            {totalPlans === 1
              ? "plan"
              : "plans"}{" "}
            available
          </p>
        </div>

        {loading ? (
          <div
            className="
              inline-flex items-center
              font-medium text-slate-500 text-xs
              gap-2
            "
          >
            <RefreshCw
              aria-hidden="true"
              className="
                w-3.5 h-3.5
                animate-spin
              "
              /
            >

            Updating plans...
          </div>
        ) : null}
      </div>
    );
  }
);

PlansSummary.displayName = "PlansSummary";

/* ==========================================================================
   PAGINATION
========================================================================== */

const Pagination = memo(
  ({
    currentPage,
    totalPages,
    totalItems,
    limit,
    onPrevious,
    onNext,
    disabled,
  }) => {
    if (
      totalPages <= 1 &&
      totalItems <= limit
    ) {
      return null;
    }

    const firstItem =
      totalItems === 0
        ? 0
        : (currentPage - 1) * limit + 1;

    const lastItem = Math.min(
      currentPage * limit,
      totalItems
    );

    return (
      <nav
        aria-label="Saving plan pagination"
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          mt-6 p-4
          bg-white
          border border-slate-200 rounded-2xl
          shadow-sm
          gap-3
        "
      >
        <p
          className="
            text-slate-500 text-xs
          "
        >
          Showing{" "}
          <span
            className="
              font-semibold text-slate-700
            "
          >
            {firstItem}
          </span>
          {"–"}
          <span
            className="
              font-semibold text-slate-700
            "
          >
            {lastItem}
          </span>{" "}
          of{" "}
          <span
            className="
              font-semibold text-slate-700
            "
          >
            {totalItems}
          </span>{" "}
          plans
        </p>

        <div
          className="
            flex items-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={onPrevious}
            disabled={
              disabled ||
              currentPage <= 1
            }
            className="
              inline-flex justify-center items-center
              h-9
              px-3
              font-semibold text-slate-700 text-xs
              bg-white hover:bg-slate-50
              border border-slate-200 rounded-lg
              disabled:opacity-40 transition
              disabled:cursor-not-allowed
              gap-1
            "
          >
            <ChevronLeft
              aria-hidden="true"
              className="
                w-4 h-4
              "
              /
            >
            Previous
          </button>

          <span
            aria-current="page"
            className="
              inline-flex justify-center items-center
              min-w-9 h-9
              px-2
              font-semibold text-white text-xs
              bg-slate-950
              rounded-lg
            "
          >
            {currentPage}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={
              disabled ||
              currentPage >= totalPages
            }
            className="
              inline-flex
              justify-center
              items-center
              gap-1
              bg-white
              hover:bg-slate-50
              disabled:opacity-40
              px-3
              border border-slate-200
              rounded-lg
              h-9
              font-semibold
              text-slate-700
              text-xs
              transition
              disabled:cursor-not-allowed
            "
          >
            Next

            <ChevronRight
              aria-hidden="true"
              className="
                w-4 h-4
              "
              /
            >
          </button>
        </div>
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";

/* ==========================================================================
   PAGE
========================================================================== */

const SavingPlansPage = () => {
  const {
    plans,
    filters,

    loading,

    fetchPlans,
    refreshPlans,

    setFilters,
    setPage,
    resetFilters,

    createPlan,
    updatePlan,
    activatePlan,
    pausePlan,
    resumePlan,
    completePlan,
    cancelPlan,

    creating,
    updating,
    activating,
    pausing,
    resuming,
    completing,
    cancelling,

    recalculating,
    refreshingProgress,

    isMutating,
    isBusy,

    currentPage,
    currentLimit,
    totalPlans,
    totalPages,

    hasPlans,
    getPlanById,

    error,
    clearError,
  } = useSavingPlans({
    initialFilters: DEFAULT_FILTERS,
    autoFetch: true,
  });

  /* ------------------------------------------------------------------------
     Local filter state
  ------------------------------------------------------------------------ */

  const [search, setSearch] = useState(
    filters?.search ?? ""
  );

  const [status, setStatus] = useState(
    filters?.status ?? ""
  );

  /* ------------------------------------------------------------------------
     UI state
  ------------------------------------------------------------------------ */

  const [
    selectedPlanId,
    setSelectedPlanId,
  ] = useState(null);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState(null);

  /* ------------------------------------------------------------------------
     Selected plan
  ------------------------------------------------------------------------ */

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) {
      return null;
    }

    return getPlanById(selectedPlanId);
  }, [
    selectedPlanId,
    getPlanById,
  ]);

  /* ------------------------------------------------------------------------
     Busy states
  ------------------------------------------------------------------------ */

  const refreshing =
    loading && hasPlans;

  const actionBusy =
    activating ||
    pausing ||
    resuming ||
    completing ||
    cancelling ||
    recalculating ||
    refreshingProgress;

  const pageDisabled =
    isMutating;

  /* ------------------------------------------------------------------------
     Filter handlers
  ------------------------------------------------------------------------ */

  const handleSearchChange = useCallback(
    (value) => {
      setSearch(value);
    },
    []
  );

  const handleStatusChange = useCallback(
    (value) => {
      setStatus(value);
    },
    []
  );

  const handleApplyFilters = useCallback(
    () => {
      const normalizedSearch =
        normalizeSearchValue(search);

      setActionError(null);

      setFilters(
        {
          search: normalizedSearch,
          status: status || "",
          page: 1,
        },
        {
          resetPage: false,
          fetch: true,
        }
      );
    },
    [
      search,
      status,
      setFilters,
    ]
  );

  const handleClearFilters = useCallback(
    () => {
      setSearch("");
      setStatus("");
      setActionError(null);

      resetFilters({
        fetch: true,
      });
    },
    [resetFilters]
  );

  /* ------------------------------------------------------------------------
     Refresh
  ------------------------------------------------------------------------ */

  const handleRefresh = useCallback(
    async () => {
      setActionError(null);

      await refreshPlans({
        preserveData: true,
        silent: false,
      });
    },
    [refreshPlans]
  );

  /* ------------------------------------------------------------------------
     Retry
  ------------------------------------------------------------------------ */

  const handleRetry = useCallback(
    async () => {
      setActionError(null);
      clearError();

      await fetchPlans(
        filters,
        {
          preserveData: false,
          silent: false,
        }
      );
    },
    [
      clearError,
      fetchPlans,
      filters,
    ]
  );

  /* ------------------------------------------------------------------------
     Create
  ------------------------------------------------------------------------ */

  const handleOpenCreate = useCallback(
    () => {
      setActionError(null);
      setCreateOpen(true);
    },
    []
  );

  const handleCloseCreate = useCallback(
    () => {
      if (creating) {
        return;
      }

      setCreateOpen(false);
    },
    [creating]
  );

  const handleCreate = useCallback(
    async (payload) => {
      setActionError(null);

      const result =
        await createPlan(payload);

      if (result?.success) {
        setCreateOpen(false);
      } else if (result) {
        setActionError(
          getMutationResultError(result)
        );
      }

      return result;
    },
    [createPlan]
  );

  /* ------------------------------------------------------------------------
     View
  ------------------------------------------------------------------------ */

  const handleViewPlan = useCallback(
    (plan) => {
      const planId =
        getSavingPlanId(plan);

      if (!planId) {
        return;
      }

      setSelectedPlanId(
        String(planId)
      );

      setDetailsOpen(true);
      setActionError(null);
    },
    []
  );

  const handleCloseDetails =
    useCallback(() => {
      if (actionBusy) {
        return;
      }

      setDetailsOpen(false);
    }, [actionBusy]);

  /* ------------------------------------------------------------------------
     Edit
  ------------------------------------------------------------------------ */

  const handleOpenEdit = useCallback(
    (plan) => {
      const planId =
        getSavingPlanId(plan);

      if (!planId) {
        return;
      }

      setSelectedPlanId(
        String(planId)
      );

      setEditOpen(true);
      setDetailsOpen(false);
      setActionError(null);
    },
    []
  );

  const handleCloseEdit = useCallback(
    () => {
      if (updating) {
        return;
      }

      setEditOpen(false);
    },
    [updating]
  );

  const handleUpdate = useCallback(
    async (
      planId,
      payload
    ) => {
      setActionError(null);

      const result =
        await updatePlan(
          planId,
          payload
        );

      if (result?.success) {
        setEditOpen(false);
      } else if (result) {
        setActionError(
          getMutationResultError(result)
        );
      }

      return result;
    },
    [updatePlan]
  );

  /* ------------------------------------------------------------------------
     Delete
  ------------------------------------------------------------------------ */

  const handleOpenDelete =
    useCallback((plan) => {
      const planId =
        getSavingPlanId(plan);

      if (!planId) {
        return;
      }

      setSelectedPlanId(
        String(planId)
      );

      setDeleteOpen(true);
      setDetailsOpen(false);
      setActionError(null);
    }, []);

  const handleCloseDelete =
    useCallback(() => {
      if (cancelling) {
        return;
      }

      setDeleteOpen(false);
    }, [cancelling]);

  const handleDelete =
    useCallback(async () => {
      if (!selectedPlanId) {
        const result = {
          success: false,
          error: new Error(
            "A saving plan ID is required."
          ),
        };

        setActionError(
          getMutationResultError(result)
        );

        return result;
      }

      setActionError(null);

      const result =
        await cancelPlan(
          selectedPlanId
        );

      if (result?.success) {
        setDeleteOpen(false);
        setDetailsOpen(false);
        setSelectedPlanId(null);
      } else if (result) {
        setActionError(
          getMutationResultError(result)
        );
      }

      return result;
    }, [
      cancelPlan,
      selectedPlanId,
    ]);

  /* ------------------------------------------------------------------------
     Lifecycle actions
  ------------------------------------------------------------------------ */

  const runPlanAction =
    useCallback(
      async (
        plan,
        action
      ) => {
        const planId =
          getSavingPlanId(plan);

        if (!planId) {
          return null;
        }

        setActionError(null);

        const result =
          await action(planId);

        if (
          result &&
          result.success === false
        ) {
          setActionError(
            getMutationResultError(result)
          );
        }

        return result;
      },
      []
    );

  const handlePause = useCallback(
    (plan) =>
      runPlanAction(
        plan,
        pausePlan
      ),
    [
      pausePlan,
      runPlanAction,
    ]
  );

  const handleResume = useCallback(
    (plan) =>
      runPlanAction(
        plan,
        resumePlan
      ),
    [
      resumePlan,
      runPlanAction,
    ]
  );

  const handleActivate = useCallback(
    (plan) =>
      runPlanAction(
        plan,
        activatePlan
      ),
    [
      activatePlan,
      runPlanAction,
    ]
  );

  const handleComplete = useCallback(
    (plan) =>
      runPlanAction(
        plan,
        completePlan
      ),
    [
      completePlan,
      runPlanAction,
    ]
  );

  const handleCancel = useCallback(
    (plan) =>
      runPlanAction(
        plan,
        cancelPlan
      ),
    [
      cancelPlan,
      runPlanAction,
    ]
  );

  /* ------------------------------------------------------------------------
     Pagination
  ------------------------------------------------------------------------ */

  const handlePreviousPage =
    useCallback(() => {
      if (
        currentPage <= 1 ||
        isBusy
      ) {
        return;
      }

      setPage(
        currentPage - 1,
        {
          fetch: true,
        }
      );
    }, [
      currentPage,
      isBusy,
      setPage,
    ]);

  const handleNextPage =
    useCallback(() => {
      if (
        currentPage >= totalPages ||
        isBusy
      ) {
        return;
      }

      setPage(
        currentPage + 1,
        {
          fetch: true,
        }
      );
    }, [
      currentPage,
      totalPages,
      isBusy,
      setPage,
    ]);

  /* ------------------------------------------------------------------------
     Derived state
  ------------------------------------------------------------------------ */

  const showInitialLoading =
    loading && !hasPlans;

  const showEmpty =
    !loading &&
    !hasPlans &&
    !error;

  const hasActiveFilters =
    Boolean(
      normalizeSearchValue(search)
    ) ||
    Boolean(status);

  const pageError =
    actionError || error;

  /* ------------------------------------------------------------------------
     Render
  ------------------------------------------------------------------------ */

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
          mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8
        "
      >
        <PageHeader
          onCreate={handleOpenCreate}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          disabled={pageDisabled}
        />

        {pageError ? (
          <PageError
            error={pageError}
            onRetry={
              actionError
                ? null
                : handleRetry
            }
            onDismiss={() => {
              setActionError(null);
              clearError();
            }}
            retrying={loading}
          />
        ) : null}

        <FilterBar
          search={search}
          status={status}
          onSearchChange={
            handleSearchChange
          }
          onStatusChange={
            handleStatusChange
          }
          onApply={
            handleApplyFilters
          }
          onClear={
            handleClearFilters
          }
          disabled={pageDisabled}
          hasActiveFilters={
            hasActiveFilters
          }
        />

        {showInitialLoading ? (
          <section
            aria-label="Loading saving plans"
            aria-busy="true"
            className="
              p-4 sm:p-5
              bg-white
              border border-slate-200 rounded-2xl
              shadow-sm
            "
          >
            <div
              className="
                flex justify-between items-center
                mb-5
              "
            >
              <div
                className="
                  space-y-2
                "
              >
                <div
                  className="
                    w-32 h-4
                    bg-slate-200
                    rounded
                    animate-pulse
                  "
                  /
                >

                <div
                  className="
                    w-48 h-3
                    bg-slate-100
                    rounded
                    animate-pulse
                  "
                  /
                >
              </div>

              <div
                className="
                  w-24 h-9
                  bg-slate-100
                  rounded-lg
                  animate-pulse
                "
                /
              >
            </div>

            <div
              className="
                grid md:grid-cols-2
                gap-4
              "
            >
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      p-5
                      border border-slate-100 rounded-2xl
                    "
                  >
                    <div
                      className="
                        flex justify-between items-center
                        mb-4
                      "
                    >
                      <div
                        className="
                          w-36 h-4
                          bg-slate-200
                          rounded
                          animate-pulse
                        "
                        /
                      >

                      <div
                        className="
                          w-20 h-6
                          bg-slate-100
                          rounded-full
                          animate-pulse
                        "
                        /
                      >
                    </div>

                    <div
                      className="
                        w-full h-3
                        mb-3
                        bg-slate-100
                        rounded
                        animate-pulse
                      "
                      /
                    >

                    <div
                      className="
                        w-4/5 h-3
                        mb-6
                        bg-slate-100
                        rounded
                        animate-pulse
                      "
                      /
                    >

                    <div
                      className="
                        w-full h-2
                        bg-slate-100
                        rounded-full
                        animate-pulse
                      "
                      /
                    >

                    <div
                      className="
                        flex justify-between
                        mt-5
                      "
                    >
                      <div
                        className="
                          w-20 h-3
                          bg-slate-100
                          rounded
                          animate-pulse
                        "
                        /
                      >

                      <div
                        className="
                          w-16 h-3
                          bg-slate-100
                          rounded
                          animate-pulse
                        "
                        /
                      >
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        ) : null}

        {showEmpty ? (
          <SavingPlanEmptyState
            variant={
              hasActiveFilters
                ? "noResults"
                : "noPlans"
            }
            onAction={
              hasActiveFilters
                ? handleClearFilters
                : handleOpenCreate
            }
            actionLabel={
              hasActiveFilters
                ? "Clear filters"
                : "Create saving plan"
            }
          />
        ) : null}

        {!showInitialLoading &&
        !showEmpty &&
        hasPlans ? (
          <section aria-label="Saving plans">
            <PlansSummary
              totalPlans={totalPlans}
              loading={loading}
            />

            <SavingPlanList
              plans={plans}
              loading={loading}
              error={null}
              selectedPlanId={
                selectedPlanId
              }
              onSelect={
                handleViewPlan
              }
              onView={
                handleViewPlan
              }
              onEdit={
                handleOpenEdit
              }
              onDelete={
                handleOpenDelete
              }
              onPause={
                handlePause
              }
              onResume={
                handleResume
              }
              onActivate={
                handleActivate
              }
              onComplete={
                handleComplete
              }
              onCancel={
                handleCancel
              }
              deleting={cancelling}
              updating={
                updating ||
                actionBusy
              }
              disabled={isMutating}
              onRetry={
                handleRetry
              }
              onCreate={
                handleOpenCreate
              }
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalPlans}
              limit={currentLimit}
              onPrevious={
                handlePreviousPage
              }
              onNext={
                handleNextPage
              }
              disabled={isBusy}
            />
          </section>
        ) : null}

        {/* ------------------------------------------------------------------
            IMPORTANT:
            These components are mounted only when they are actually open.
            This prevents an invalid imported component from crashing the
            entire page during the initial render while all overlays are
            closed.
        ------------------------------------------------------------------ */}

        {createOpen ? (
          <CreateSavingPlanModal
            open={createOpen}
            onClose={
              handleCloseCreate
            }
            onSubmit={handleCreate}
            submitting={creating}
          />
        ) : null}

        {editOpen ? (
          <EditSavingPlanModal
            open={editOpen}
            plan={selectedPlan}
            onClose={
              handleCloseEdit
            }
            onSubmit={handleUpdate}
            submitting={updating}
          />
        ) : null}

        {deleteOpen ? (
          <DeleteSavingPlanDialog
            open={deleteOpen}
            plan={selectedPlan}
            deleting={cancelling}
            error={actionError}
            onConfirm={handleDelete}
            onClose={
              handleCloseDelete
            }
          />
        ) : null}

        {detailsOpen ? (
          <SavingPlanDetailsDrawer
            open={detailsOpen}
            plan={selectedPlan}
            onClose={
              handleCloseDetails
            }
            onEdit={
              handleOpenEdit
            }
            onDelete={
              handleOpenDelete
            }
            onPause={
              handlePause
            }
            onResume={
              handleResume
            }
            deleting={cancelling}
            updating={actionBusy}
            error={actionError}
          />
        ) : null}
      </div>
    </main>
  );
};

export default memo(SavingPlansPage);