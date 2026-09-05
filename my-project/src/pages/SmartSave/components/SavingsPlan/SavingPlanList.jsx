import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  memo,
  useCallback,
  useMemo,
} from "react";

import SavingPlanCard from "./SavingPlanCard";
import SavingPlanEmptyState from "./SavingPlanEmptyState";

import {
  findSavingPlanById,
  getSavingPlanId,
} from "../../../../utils/smartSave/savingPlanHelpers";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_EMPTY_TITLE = "No saving plans yet";

const DEFAULT_EMPTY_DESCRIPTION =
  "Create your first saving plan and start working toward your financial goal.";

const DEFAULT_ERROR_TITLE =
  "Unable to load saving plans";

const DEFAULT_ERROR_DESCRIPTION =
  "Something went wrong while loading your saving plans. Please try again.";

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

const normalizePlans = (plans) => {
  if (!Array.isArray(plans)) {
    return [];
  }

  return plans.filter(Boolean);
};

const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR_DESCRIPTION;
  }

  if (typeof error === "string") {
    const message = error.trim();

    return message || DEFAULT_ERROR_DESCRIPTION;
  }

  const candidates = [
    error?.message,
    error?.error,
    error?.response?.data?.message,
    error?.response?.data?.error,
  ];

  const message = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0,
  );

  return message?.trim() || DEFAULT_ERROR_DESCRIPTION;
};

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

const SavingPlanListLoading = memo(
  ({
    className = "",
    testId = "saving-plan-list",
  }) => {
    return (
      <section
        data-testid={testId}
        aria-busy="true"
        aria-live="polite"
        className={cn(
          "flex w-full min-h-[320px]",
          "items-center justify-center",
          "px-4 py-10",
          className,
        )}
      >
        <div
          className="
            flex flex-col items-center
            text-center
            gap-4
          "
        >
          <div
            aria-hidden="true"
            className="
              flex justify-center items-center
              w-12 h-12
              bg-slate-100
              rounded-full
            "
          >
            <Loader2
              size={24}
              strokeWidth={2}
              className="
                text-slate-600
                animate-spin
              "
              /
            >
          </div>

          <div
            className="
              space-y-1
            "
          >
            <p
              className="
                font-semibold text-slate-900 text-sm
              "
            >
              Loading saving plans
            </p>

            <p
              className="
                text-slate-500 text-sm leading-6
              "
            >
              Please wait while your plans are loaded.
            </p>
          </div>
        </div>
      </section>
    );
  },
);

SavingPlanListLoading.displayName =
  "SavingPlanListLoading";

/* -------------------------------------------------------------------------- */
/* Error State                                                                */
/* -------------------------------------------------------------------------- */

const SavingPlanListError = memo(
  ({
    message,
    disabled = false,
    onRetry,
    className = "",
    testId = "saving-plan-list",
  }) => {
    const canRetry =
      typeof onRetry === "function" &&
      !disabled;

    return (
      <section
        data-testid={testId}
        role="alert"
        aria-live="assertive"
        className={cn(
          "flex w-full min-h-[320px]",
          "items-center justify-center",
          "px-4 py-10",
          className,
        )}
      >
        <div
          className="
            flex flex-col items-center
            w-full max-w-md
            text-center
          "
        >
          <div
            aria-hidden="true"
            className="
              flex justify-center items-center
              w-14 h-14
              mb-4
              bg-red-50
              border border-red-100 rounded-2xl
            "
          >
            <AlertCircle
              size={28}
              strokeWidth={1.8}
              className="
                text-red-600
              "
              /
            >
          </div>

          <h2
            className="
              font-semibold text-slate-900 text-lg
            "
          >
            {DEFAULT_ERROR_TITLE}
          </h2>

          <p
            className="
              mt-2
              text-slate-500 text-sm leading-6
            "
          >
            {message || DEFAULT_ERROR_DESCRIPTION}
          </p>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={onRetry}
              disabled={!canRetry}
              className={cn(
                "inline-flex items-center mt-5",
                "justify-center gap-2",
                "rounded-xl bg-slate-900",
                "px-4 py-2.5",
                "text-sm font-semibold text-white",
                "shadow-sm transition",
                "hover:bg-slate-800",
                "active:scale-[0.98]",
                "focus:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-slate-900",
                "focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
              )}
            >
              <RefreshCw
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span>Try again</span>
            </button>
          )}
        </div>
      </section>
    );
  },
);

SavingPlanListError.displayName =
  "SavingPlanListError";

/* -------------------------------------------------------------------------- */
/* Background Refresh Indicator                                               */
/* -------------------------------------------------------------------------- */

const SavingPlanRefreshIndicator = memo(
  () => {
    return (
      <div
        aria-live="polite"
        className="
          flex items-center
          mb-4
          text-slate-500 text-sm
          gap-2
        "
      >
        <Loader2
          size={15}
          strokeWidth={2}
          className="
            animate-spin
          "
          aria-hidden="true"
        /
        >

        <span>
          Refreshing saving plans...
        </span>
      </div>
    );
  },
);

SavingPlanRefreshIndicator.displayName =
  "SavingPlanRefreshIndicator";

/* -------------------------------------------------------------------------- */
/* Background Error                                                           */
/* -------------------------------------------------------------------------- */

const SavingPlanRefreshError = memo(
  ({
    message,
    disabled = false,
    loading = false,
    onRetry,
  }) => {
    if (!message) {
      return null;
    }

    const retryDisabled =
      disabled || loading;

    return (
      <div
        role="status"
        aria-live="polite"
        className="
          flex items-start
          mb-5 px-4 py-3
          bg-amber-50
          border border-amber-200 rounded-xl
          gap-3
        "
      >
        <AlertCircle
          size={18}
          strokeWidth={2}
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
            flex-1
            min-w-0
          "
        >
          <p
            className="
              font-semibold text-amber-900 text-sm
            "
          >
            We couldn't refresh your plans.
          </p>

          <p
            className="
              mt-1
              text-amber-800 text-sm leading-5
            "
          >
            {message}
          </p>
        </div>

        {typeof onRetry === "function" && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retryDisabled}
            className="
              px-3 py-1.5
              font-semibold text-amber-900 text-sm
              hover:bg-amber-100
              rounded-lg focus:outline-none
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              focus-visible:ring-2 focus-visible:ring-amber-600 shrink-0
            "
          >
            Retry
          </button>
        )}
      </div>
    );
  },
);

SavingPlanRefreshError.displayName =
  "SavingPlanRefreshError";

/* -------------------------------------------------------------------------- */
/* SavingPlanList                                                             */
/* -------------------------------------------------------------------------- */

const SavingPlanList = ({
  plans = [],
  loading = false,
  error = null,

  onRetry,
  onCreate,
  onClearFilters,

  onEdit,
  onDelete,
  onView,
  onPause,
  onResume,
  onSelect,

  selectedPlanId = null,

  deletingPlanId = null,
  updatingPlanId = null,

  disabled = false,

  emptyVariant = "noPlans",
  emptyTitle = DEFAULT_EMPTY_TITLE,
  emptyDescription = DEFAULT_EMPTY_DESCRIPTION,
  emptyActionLabel = "Create saving plan",

  showActions = true,
  showDescription = true,
  showProgress = true,

  compact = false,

  className = "",
  gridClassName = "",

  testId = "saving-plan-list",
}) => {
  /* ------------------------------------------------------------------------ */
  /* Normalize collection                                                    */
  /* ------------------------------------------------------------------------ */

  const normalizedPlans = useMemo(
    () => normalizePlans(plans),
    [plans],
  );

  /* ------------------------------------------------------------------------ */
  /* Selected plan                                                           */
  /* ------------------------------------------------------------------------ */

  const selectedPlan = useMemo(
    () =>
      findSavingPlanById(
        normalizedPlans,
        selectedPlanId,
      ),
    [normalizedPlans, selectedPlanId],
  );

  /* ------------------------------------------------------------------------ */
  /* Error message                                                            */
  /* ------------------------------------------------------------------------ */

  const errorMessage = useMemo(
    () => getErrorMessage(error),
    [error],
  );

  /* ------------------------------------------------------------------------ */
  /* Action handlers                                                          */
  /* ------------------------------------------------------------------------ */

  const handleCreate = useCallback(
    (event) => {
      if (
        disabled ||
        typeof onCreate !== "function"
      ) {
        return;
      }

      onCreate(event);
    },
    [disabled, onCreate],
  );

  const handleRetry = useCallback(
    (event) => {
      if (
        disabled ||
        loading ||
        typeof onRetry !== "function"
      ) {
        return;
      }

      onRetry(event);
    },
    [disabled, loading, onRetry],
  );

  const handleClearFilters = useCallback(
    (event) => {
      if (
        disabled ||
        typeof onClearFilters !== "function"
      ) {
        return;
      }

      onClearFilters(event);
    },
    [disabled, onClearFilters],
  );

  const handleEdit = useCallback(
    (plan, event) => {
      if (
        disabled ||
        typeof onEdit !== "function"
      ) {
        return;
      }

      onEdit(plan, event);
    },
    [disabled, onEdit],
  );

  const handleDelete = useCallback(
    (plan, event) => {
      if (
        disabled ||
        typeof onDelete !== "function"
      ) {
        return;
      }

      onDelete(plan, event);
    },
    [disabled, onDelete],
  );

  const handleView = useCallback(
    (plan, event) => {
      if (
        disabled ||
        typeof onView !== "function"
      ) {
        return;
      }

      onView(plan, event);
    },
    [disabled, onView],
  );

  const handlePause = useCallback(
    (plan, event) => {
      if (
        disabled ||
        typeof onPause !== "function"
      ) {
        return;
      }

      onPause(plan, event);
    },
    [disabled, onPause],
  );

  const handleResume = useCallback(
    (plan, event) => {
      if (
        disabled ||
        typeof onResume !== "function"
      ) {
        return;
      }

      onResume(plan, event);
    },
    [disabled, onResume],
  );

  const handleSelect = useCallback(
    (plan, event) => {
      if (
        disabled ||
        typeof onSelect !== "function"
      ) {
        return;
      }

      onSelect(plan, event);
    },
    [disabled, onSelect],
  );

  /* ------------------------------------------------------------------------ */
  /* Plan state helpers                                                       */
  /* ------------------------------------------------------------------------ */

  const getPlanState = useCallback(
    (plan) => {
      const planId = getSavingPlanId(plan);

      const isDeleting =
        planId !== null &&
        planId === deletingPlanId;

      const isUpdating =
        planId !== null &&
        planId === updatingPlanId;

      return {
        id: planId,
        deleting: isDeleting,
        updating: isUpdating,
        disabled:
          disabled ||
          isDeleting ||
          isUpdating,
      };
    },
    [
      disabled,
      deletingPlanId,
      updatingPlanId,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Initial loading                                                          */
  /* ------------------------------------------------------------------------ */

  if (
    loading &&
    normalizedPlans.length === 0
  ) {
    return (
      <SavingPlanListLoading
        className={className}
        testId={testId}
      />
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Initial error                                                            */
  /* ------------------------------------------------------------------------ */

  if (
    error &&
    normalizedPlans.length === 0
  ) {
    return (
      <SavingPlanListError
        message={errorMessage}
        disabled={disabled}
        onRetry={onRetry ? handleRetry : undefined}
        className={className}
        testId={testId}
      />
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Empty collection                                                         */
  /* ------------------------------------------------------------------------ */

  if (normalizedPlans.length === 0) {
    const isFilteredEmpty =
      emptyVariant === "noResults";

    const canCreate =
      typeof onCreate === "function";

    const canClearFilters =
      typeof onClearFilters === "function";

    const actionHandler = isFilteredEmpty
      ? canClearFilters
        ? handleClearFilters
        : canCreate
          ? handleCreate
          : undefined
      : canCreate
        ? handleCreate
        : undefined;

    const actionLabel =
      isFilteredEmpty && canClearFilters
        ? "Clear filters"
        : emptyActionLabel;

    return (
      <section
        data-testid={testId}
        className={cn(
          "w-full",
          className,
        )}
      >
        <SavingPlanEmptyState
          variant={emptyVariant}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={actionLabel}
          onAction={actionHandler}
          showAction={Boolean(actionHandler)}
          disabled={disabled}
          compact={compact}
        />
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Normal collection                                                        */
  /* ------------------------------------------------------------------------ */

  return (
    <section
      data-testid={testId}
      aria-busy={loading || undefined}
      className={cn(
        "w-full",
        className,
      )}
    >
      {/* Background refresh indicator */}
      {loading && (
        <SavingPlanRefreshIndicator />
      )}

      {/* Background refresh error */}
      {error && (
        <SavingPlanRefreshError
          message={errorMessage}
          disabled={disabled}
          loading={loading}
          onRetry={
            onRetry
              ? handleRetry
              : undefined
          }
        />
      )}

      {/* Plans grid */}
      <div
        className={cn(
          "gap-4 grid w-full",
          compact
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          gridClassName,
        )}
      >
        {normalizedPlans.map(
          (plan, index) => {
            const planId =
              getSavingPlanId(plan);

            const planState =
              getPlanState(plan);

            /*
             * A backend-generated ID is always
             * preferred. The index fallback is only
             * a defensive measure for malformed data.
             */
            const key =
              planId !== null
                ? String(planId)
                : `saving-plan-fallback-${index}`;

            const isSelected =
              selectedPlanId !== null &&
              selectedPlanId !== undefined &&
              planId === selectedPlanId;

            return (
              <SavingPlanCard
                key={key}
                plan={plan}

                onEdit={
                  typeof onEdit === "function"
                    ? handleEdit
                    : undefined
                }

                onDelete={
                  typeof onDelete === "function"
                    ? handleDelete
                    : undefined
                }

                onView={
                  typeof onView === "function"
                    ? handleView
                    : undefined
                }

                onPause={
                  typeof onPause === "function"
                    ? handlePause
                    : undefined
                }

                onResume={
                  typeof onResume === "function"
                    ? handleResume
                    : undefined
                }

                onSelect={
                  typeof onSelect === "function"
                    ? handleSelect
                    : undefined
                }

                selected={isSelected}

                disabled={planState.disabled}
                deleting={planState.deleting}
                updating={planState.updating}

                showActions={showActions}
                showDescription={showDescription}
                showProgress={showProgress}

                compact={compact}
              />
            );
          },
        )}
      </div>

      {/* Accessible selected-plan context */}
      {selectedPlan && (
        <span
          className="
            sr-only
          "
        >
          Selected saving plan:{" "}
          {getSavingPlanId(selectedPlan)}
        </span>
      )}
    </section>
  );
};

SavingPlanList.displayName =
  "SavingPlanList";

export default memo(SavingPlanList);