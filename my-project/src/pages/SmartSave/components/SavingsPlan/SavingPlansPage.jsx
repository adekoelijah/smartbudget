/**
 * SavingPlansPage.jsx
 *
 * Production-ready SmartSave Saving Plans page.
 *
 * Responsibilities:
 * - Orchestrate saving-plan data through useSavingPlans.
 * - Manage page-level UI state.
 * - Coordinate create/edit/delete/detail interactions.
 * - Coordinate pause/resume/activate/complete/cancel actions.
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
 * The page does NOT call smartSaveService directly.
 * Financial calculations and business rules remain server-side.
 */

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import useSavingPlans from "../../../../hooks/useSavingPlans";

import SavingPlanCard from "./SavingPlanCard";
import SavingPlanDetailsDrawer from "./SavingPlanDetailsDrawer";
import SavingPlanEmptyState from "./SavingPlanEmptyState";
import SavingPlanList from "./SavingPlanList";
import SavingPlanStats from "./SavingPlanStats";
import SavingPlanTimeline from "./SavingPlanTimeline";

import CreateSavingPlanModal from "./CreateSavingPlanModal";
import EditSavingPlanModal from "./EditSavingPlanModal";
import DeleteSavingPlanDialog from "./DeleteSavingPlanDialog";

import {
  getSavingPlanId,
  getSavingPlanName,
  getSavingPlanStatus,
  isSavingPlanActive,
  isSavingPlanPaused,
} from "../../../../utils/smartSave/savingPlanHelpers";

import {
  formatSavingPlanStatus,
} from "../../../../utils/smartSave/savingPlanFormatters";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_FILTERS = {
  page: 1,
  limit: 20,
};

const STATUS_OPTIONS = [
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
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getErrorText = (error) => {
  if (!error) {
    return "";
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }

  if (
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  if (
    typeof error.error === "string" &&
    error.error.trim()
  ) {
    return error.error;
  }

  if (
    typeof error.data?.message === "string" &&
    error.data.message.trim()
  ) {
    return error.data.message;
  }

  return "Something went wrong while processing your saving plans.";
};

const getMutationResultError = (result) => {
  if (!result || result.success !== false) {
    return "";
  }

  return getErrorText(result.error);
};

const normalizeSearchValue = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

/* -------------------------------------------------------------------------- */
/* Error banner                                                               */
/* -------------------------------------------------------------------------- */

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
      <div
        role="alert"
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          mb-6 p-4
          bg-red-50
          border border-red-200 rounded-2xl
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
          <span
            className="
              flex justify-center items-center
              w-9 h-9
              mt-0.5
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
          </span>

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
            gap-2 shrink-0
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
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Page header                                                                */
/* -------------------------------------------------------------------------- */

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
                inline-flex items-center
                mb-2 px-2.5 py-1
                font-semibold text-[11px] text-blue-700 uppercase tracking-wide
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
              Create, manage and monitor your saving plans from one place.
            </p>
          </div>

          <div
            className="
              flex flex-col sm:flex-row
              gap-2
            "
          >
            <button
              type="button"
              onClick={onRefresh}
              disabled={disabled || refreshing}
              className="
                inline-flex justify-center items-center
                min-h-10
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
                min-h-10
                px-4
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

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

const FilterBar = memo(
  ({
    search,
    status,
    onSearchChange,
    onStatusChange,
    onClear,
    disabled,
  }) => {
    const hasFilters =
      Boolean(search) ||
      Boolean(status);

    return (
      <section
        aria-label="Saving plan filters"
        className="
          mb-6 p-3 sm:p-4
          bg-white
          border border-slate-200 rounded-2xl
          shadow-sm
        "
      >
        <div
          className="
            flex flex-col lg:flex-row lg:items-center
            gap-3
          "
        >
          <div
            className="
              relative flex-1
              min-w-0
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
                onSearchChange(
                  event.target.value
                )
              }
              placeholder="Search saving plans..."
              disabled={disabled}
              aria-label="Search saving plans"
              className="bg-slate-50 focus:bg-white disabled:opacity-60 pr-10 pl-9 border border-slate-200 focus:border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full h-10 text-slate-900 placeholder:text-slate-400 text-sm transition disabled:cursor-not-allowed"
            />

            {search ? (
              <button
                type="button"
                onClick={() =>
                  onSearchChange("")
                }
                disabled={disabled}
                aria-label="Clear search"
                className="top-1/2 right-2 absolute flex justify-center items-center hover:bg-slate-200 disabled:opacity-50 rounded-lg w-7 h-7 text-slate-400 hover:text-slate-700 transition -translate-y-1/2 disabled:cursor-not-allowed"
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

          <div
            className="
              flex items-center
              gap-2
            "
          >
            <div
              className="
                relative flex-1 lg:flex-none
                lg:w-48
              "
            >
              <SlidersHorizontal
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

              <select
                value={status}
                onChange={(event) =>
                  onStatusChange(
                    event.target.value
                  )
                }
                disabled={disabled}
                aria-label="Filter by status"
                className="bg-slate-50 focus:bg-white disabled:opacity-60 pr-8 pl-9 border border-slate-200 focus:border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full h-10 font-medium text-slate-700 text-sm transition appearance-none disabled:cursor-not-allowed"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="
                  inline-flex justify-center items-center
                  h-10
                  px-3
                  font-semibold text-slate-600 text-xs
                  bg-white hover:bg-slate-50
                  border border-slate-200 rounded-xl
                  disabled:opacity-50 transition
                  disabled:cursor-not-allowed
                  shrink-0
                "
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

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
    if (totalPages <= 1) {
      return null;
    }

    const firstItem =
      totalItems === 0
        ? 0
        : (currentPage - 1) * limit + 1;

    const lastItem =
      Math.min(
        currentPage * limit,
        totalItems
      );

    return (
      <nav
        aria-label="Saving plan pagination"
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-center
          mt-6 p-3 sm:p-4
          bg-white
          border border-slate-200 rounded-2xl
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
            className="inline-flex justify-center items-center gap-1 bg-white hover:bg-slate-50 disabled:opacity-40 px-3 border border-slate-200 rounded-lg h-9 font-semibold text-slate-700 text-xs transition disabled:cursor-not-allowed"
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

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const SavingPlansPage = () => {
  /* ------------------------------------------------------------------------ */
  /* Data hook                                                                */
  /* ------------------------------------------------------------------------ */

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
    initialFilters:
      DEFAULT_FILTERS,
    autoFetch: true,
  });

  /* ------------------------------------------------------------------------ */
  /* Page UI state                                                            */
  /* ------------------------------------------------------------------------ */

  const [search, setSearch] =
    useState(
      filters.search ?? ""
    );

  const [status, setStatus] =
    useState(
      filters.status ?? ""
    );

  const [selectedPlanId, setSelectedPlanId] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [actionError, setActionError] =
    useState(null);

  /* ------------------------------------------------------------------------ */
  /* Selected plan                                                            */
  /* ------------------------------------------------------------------------ */

  const selectedPlan = useMemo(
    () =>
      selectedPlanId
        ? getPlanById(
            selectedPlanId
          )
        : null,
    [
      selectedPlanId,
      getPlanById,
    ]
  );

  /* ------------------------------------------------------------------------ */
  /* Busy states                                                              */
  /* ------------------------------------------------------------------------ */

  const refreshing =
    loading && hasPlans;

  const pageDisabled =
    isMutating;

  const deleteBusy =
    cancelling;

  const editBusy =
    updating;

  const actionBusy =
    activating ||
    pausing ||
    resuming ||
    completing ||
    cancelling ||
    recalculating ||
    refreshingProgress;

  /* ------------------------------------------------------------------------ */
  /* Filter handlers                                                          */
  /* ------------------------------------------------------------------------ */

  const applyFilters = useCallback(
    (nextSearch, nextStatus) => {
      setFilters(
        {
          search:
            normalizeSearchValue(
              nextSearch
            ),
          status:
            nextStatus || "",
          page: 1,
        },
        {
          resetPage: false,
          fetch: true,
        }
      );
    },
    [setFilters]
  );

  const handleSearchChange =
    useCallback(
      (value) => {
        setSearch(value);

        applyFilters(
          value,
          status
        );
      },
      [
        applyFilters,
        status,
      ]
    );

  const handleStatusChange =
    useCallback(
      (value) => {
        setStatus(value);

        applyFilters(
          search,
          value
        );
      },
      [
        applyFilters,
        search,
      ]
    );

  const handleClearFilters =
    useCallback(() => {
      setSearch("");
      setStatus("");

      resetFilters({
        fetch: true,
      });
    }, [resetFilters]);

  /* ------------------------------------------------------------------------ */
  /* Refresh                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleRefresh =
    useCallback(async () => {
      setActionError(null);

      await refreshPlans({
        preserveData: true,
        silent: false,
      });
    }, [refreshPlans]);

  /* ------------------------------------------------------------------------ */
  /* Retry                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleRetry =
    useCallback(async () => {
      clearError();
      setActionError(null);

      await fetchPlans(
        filters,
        {
          preserveData: false,
          silent: false,
        }
      );
    }, [
      clearError,
      fetchPlans,
      filters,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleOpenCreate =
    useCallback(() => {
      setActionError(null);
      setCreateOpen(true);
    }, []);

  const handleCloseCreate =
    useCallback(() => {
      if (creating) {
        return;
      }

      setCreateOpen(false);
    }, [creating]);

  const handleCreate =
    useCallback(
      async (payload) => {
        setActionError(null);

        const result =
          await createPlan(
            payload
          );

        if (
          result?.success
        ) {
          setCreateOpen(false);
        } else if (result) {
          setActionError(
            getMutationResultError(
              result
            )
          );
        }

        return result;
      },
      [createPlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Selection / details                                                      */
  /* ------------------------------------------------------------------------ */

  const handleViewPlan =
    useCallback((plan) => {
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
    }, []);

  const handleCloseDetails =
    useCallback(() => {
      if (actionBusy) {
        return;
      }

      setDetailsOpen(false);
    }, [actionBusy]);

  /* ------------------------------------------------------------------------ */
  /* Edit                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleOpenEdit =
    useCallback((plan) => {
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
    }, []);

  const handleCloseEdit =
    useCallback(() => {
      if (editBusy) {
        return;
      }

      setEditOpen(false);
    }, [editBusy]);

  const handleUpdate =
    useCallback(
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

        if (
          result?.success
        ) {
          setEditOpen(false);
        } else if (result) {
          setActionError(
            getMutationResultError(
              result
            )
          );
        }

        return result;
      },
      [updatePlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

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
      if (deleteBusy) {
        return;
      }

      setDeleteOpen(false);
    }, [deleteBusy]);

  const handleDelete =
    useCallback(async () => {
      if (!selectedPlanId) {
        return {
          success: false,
          error: new Error(
            "A saving plan ID is required."
          ),
        };
      }

      setActionError(null);

      const result =
        await cancelPlan(
          selectedPlanId
        );

      if (
        result?.success
      ) {
        setDeleteOpen(false);
        setDetailsOpen(false);
        setSelectedPlanId(null);
      } else if (result) {
        setActionError(
          getMutationResultError(
            result
          )
        );
      }

      return result;
    }, [
      cancelPlan,
      selectedPlanId,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Pause                                                                    */
  /* ------------------------------------------------------------------------ */

  const handlePause =
    useCallback(
      async (plan) => {
        const planId =
          getSavingPlanId(plan);

        if (!planId) {
          return null;
        }

        setActionError(null);

        const result =
          await pausePlan(
            planId
          );

        if (
          result?.success
        ) {
          return result;
        }

        if (result) {
          setActionError(
            getMutationResultError(
              result
            )
          );
        }

        return result;
      },
      [pausePlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Resume                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleResume =
    useCallback(
      async (plan) => {
        const planId =
          getSavingPlanId(plan);

        if (!planId) {
          return null;
        }

        setActionError(null);

        const result =
          await resumePlan(
            planId
          );

        if (
          result?.success
        ) {
          return result;
        }

        if (result) {
          setActionError(
            getMutationResultError(
              result
            )
          );
        }

        return result;
      },
      [resumePlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Activate                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleActivate =
    useCallback(
      async (plan) => {
        const planId =
          getSavingPlanId(plan);

        if (!planId) {
          return null;
        }

        setActionError(null);

        const result =
          await activatePlan(
            planId
          );

        if (
          result?.success
        ) {
          return result;
        }

        if (result) {
          setActionError(
            getMutationResultError(
              result
            )
          );
        }

        return result;
      },
      [activatePlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Complete                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleComplete =
    useCallback(
      async (plan) => {
        const planId =
          getSavingPlanId(plan);

        if (!planId) {
          return null;
        }

        setActionError(null);

        const result =
          await completePlan(
            planId
          );

        if (
          result?.success
        ) {
          return result;
        }

        if (result) {
          setActionError(
            getMutationResultError(
              result
            )
          );
        }

        return result;
      },
      [completePlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Cancel                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleCancel =
    useCallback(
      async (plan) => {
        const planId =
          getSavingPlanId(plan);

        if (!planId) {
          return null;
        }

        setActionError(null);

        const result =
          await cancelPlan(
            planId
          );

        if (
          result?.success
        ) {
          return result;
        }

        if (result) {
          setActionError(
            getMutationResultError(
              result
            )
          );
        }

        return result;
      },
      [cancelPlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Metrics                                                                  */
  /* ------------------------------------------------------------------------ */

  
  
  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  const handlePreviousPage =
    useCallback(() => {
      if (
        currentPage <= 1 ||
        isBusy
      ) {
        return;
      }

      const nextPage =
        currentPage - 1;

      setPage(nextPage, {
        fetch: true,
      });
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

      const nextPage =
        currentPage + 1;

      setPage(nextPage, {
        fetch: true,
      });
    }, [
      currentPage,
      isBusy,
      setPage,
      totalPages,
    ]);

  /* ------------------------------------------------------------------------ */
  /* List callbacks                                                           */
  /* ------------------------------------------------------------------------ */

  const handleSelectPlan =
    useCallback(
      (plan) => {
        handleViewPlan(plan);
      },
      [handleViewPlan]
    );

  /* ------------------------------------------------------------------------ */
  /* Derived page state                                                       */
  /* ------------------------------------------------------------------------ */

  const showInitialLoading =
    loading &&
    !hasPlans;

  const showEmpty =
    !loading &&
    !hasPlans &&
    !error;

  const visibleActionError =
    actionError ||
    getErrorText(error);

  const selectedPlanStatus =
    selectedPlan
      ? getSavingPlanStatus(
          selectedPlan
        )
      : "";

  const selectedPlanStatusLabel =
    selectedPlanStatus
      ? formatSavingPlanStatus(
          selectedPlanStatus
        )
      : "";

  const selectedPlanIsActive =
    selectedPlan
      ? isSavingPlanActive(
          selectedPlan
        )
      : false;

  const selectedPlanIsPaused =
    selectedPlan
      ? isSavingPlanPaused(
          selectedPlan
        )
      : false;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main
      className="
        min-h-full
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <PageHeader
          onCreate={handleOpenCreate}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          disabled={pageDisabled}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Errors                                                           */}
        {/* ---------------------------------------------------------------- */}

        {visibleActionError ? (
          <PageError
            error={
              actionError ||
              error
            }
            onRetry={
              actionError
                ? clearError
                : handleRetry
            }
            onDismiss={
              actionError
                ? () =>
                    setActionError(
                      null
                    )
                : clearError
            }
            retrying={loading}
          />
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Filters                                                          */}
        {/* ---------------------------------------------------------------- */}

        <FilterBar
          search={search}
          status={status}
          onSearchChange={
            handleSearchChange
          }
          onStatusChange={
            handleStatusChange
          }
          onClear={
            handleClearFilters
          }
          disabled={pageDisabled}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Initial loading                                                  */}
        {/* ---------------------------------------------------------------- */}

        {showInitialLoading ? (
          <SavingPlanList
            plans={[]}
            loading
            onRetry={handleRetry}
            onCreate={handleOpenCreate}
          />
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Empty state                                                      */}
        {/* ---------------------------------------------------------------- */}

        {showEmpty ? (
          <SavingPlanEmptyState
            variant={
              search || status
                ? "noResults"
                : "noPlans"
            }
            onAction={
              search || status
                ? handleClearFilters
                : handleOpenCreate
            }
            actionLabel={
              search || status
                ? "Clear filters"
                : "Create saving plan"
            }
          />
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Plans                                                            */}
        {/* ---------------------------------------------------------------- */}

        {!showInitialLoading &&
        !showEmpty &&
        hasPlans ? (
          <>
            <div
              className="
                flex flex-col sm:flex-row sm:justify-between sm:items-center
                mb-4
                gap-2
              "
            >
              <div>
                <p
                  className="
                    font-semibold text-slate-900 text-sm
                  "
                >
                  Your saving plans
                </p>

                <p
                  className="
                    text-slate-500 text-xs
                  "
                >
                  {totalPlans}{" "}
                  {totalPlans === 1
                    ? "plan"
                    : "plans"}
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

            <SavingPlanList
              plans={plans}
              loading={loading}
              error={null}
              selectedPlanId={
                selectedPlanId
              }
              onSelect={
                handleSelectPlan
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
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              totalItems={
                totalPlans
              }
              limit={
                currentLimit
              }
              onPrevious={
                handlePreviousPage
              }
              onNext={
                handleNextPage
              }
              disabled={
                isBusy
              }
            />
          </>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Selected plan information                                       */}
        {/* ---------------------------------------------------------------- */}

        {selectedPlan &&
        detailsOpen ? (
          <div
            className="
              sr-only
            "
          >
            <span>
              Selected plan:{" "}
              {getSavingPlanName(
                selectedPlan
              )}
            </span>

            <span>
              Status:{" "}
              {selectedPlanStatusLabel}
            </span>

            {selectedPlanIsActive ? (
              <span>
                This plan is active.
              </span>
            ) : null}

            {selectedPlanIsPaused ? (
              <span>
                This plan is paused.
              </span>
            ) : null}
          </div>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Create modal                                                     */}
        {/* ---------------------------------------------------------------- */}

        <CreateSavingPlanModal
          open={createOpen}
          onClose={
            handleCloseCreate
          }
          onSubmit={
            handleCreate
          }
          submitting={creating}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Edit modal                                                       */}
        {/* ---------------------------------------------------------------- */}

        <EditSavingPlanModal
          open={editOpen}
          plan={selectedPlan}
          onClose={
            handleCloseEdit
          }
          onSubmit={
            handleUpdate
          }
          submitting={updating}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Delete dialog                                                    */}
        {/* ---------------------------------------------------------------- */}

        <DeleteSavingPlanDialog
          open={deleteOpen}
          plan={selectedPlan}
          deleting={cancelling}
          error={
            actionError
          }
          onConfirm={
            handleDelete
          }
          onClose={
            handleCloseDelete
          }
        />

        {/* ---------------------------------------------------------------- */}
        {/* Details drawer                                                   */}
        {/* ---------------------------------------------------------------- */}

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
          updating={
            actionBusy
          }
          error={
            actionError
          }
        />

        {/* ---------------------------------------------------------------- */}
        {/* Supporting components                                            */}
        {/* ---------------------------------------------------------------- */}

        {selectedPlan ? (
          <div
            className="
              sr-only
            "
          >
            <SavingPlanCard
              plan={selectedPlan}
            />

            <SavingPlanStats
              plan={selectedPlan}
            />

            <SavingPlanTimeline
              plan={selectedPlan}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default memo(
  SavingPlansPage
);