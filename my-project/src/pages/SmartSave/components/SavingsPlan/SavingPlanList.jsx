// components/.../SavingPlanList.js

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

/**
 * SavingPlanList
 *
 * Responsible only for rendering and coordinating a collection
 * of saving plans.
 *
 * Responsibilities:
 * - Render saving plan cards
 * - Render loading, error, and empty states
 * - Coordinate selection
 * - Delegate edit/delete/view/pause/resume actions
 * - Preserve stable callback references where practical
 *
 * This component intentionally does NOT:
 * - Fetch plans
 * - Call APIs
 * - Perform financial calculations
 * - Mutate plan data
 * - Synchronize state through effects
 */

const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

const DEFAULT_EMPTY_TITLE = "No saving plans yet";

const DEFAULT_EMPTY_DESCRIPTION =
  "Create your first saving plan and start working toward your financial goal.";

const DEFAULT_ERROR_TITLE =
  "Unable to load saving plans";

const DEFAULT_ERROR_DESCRIPTION =
  "Something went wrong while loading your saving plans. Please try again.";

const normalizePlans = (plans) =>
  Array.isArray(plans)
    ? plans.filter(Boolean)
    : [];

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error.trim();
  }

  if (
    typeof error?.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  if (
    typeof error?.error === "string" &&
    error.error.trim()
  ) {
    return error.error.trim();
  }

  if (
    typeof error?.response?.data?.message === "string" &&
    error.response.data.message.trim()
  ) {
    return error.response.data.message.trim();
  }

  return DEFAULT_ERROR_DESCRIPTION;
};

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
  const normalizedPlans = useMemo(
    () => normalizePlans(plans),
    [plans],
  );

  const selectedPlan = useMemo(
    () =>
      findSavingPlanById(
        normalizedPlans,
        selectedPlanId,
      ),
    [normalizedPlans, selectedPlanId],
  );

  const errorMessage = useMemo(
    () => getErrorMessage(error),
    [error],
  );

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

  const getPlanDisabledState = useCallback(
    (plan) => {
      const planId = getSavingPlanId(plan);

      return (
        disabled ||
        planId === deletingPlanId ||
        planId === updatingPlanId
      );
    },
    [
      disabled,
      deletingPlanId,
      updatingPlanId,
    ],
  );

  const getPlanDeletingState = useCallback(
    (plan) => {
      const planId = getSavingPlanId(plan);

      return (
        planId !== null &&
        planId === deletingPlanId
      );
    },
    [deletingPlanId],
  );

  const getPlanUpdatingState = useCallback(
    (plan) => {
      const planId = getSavingPlanId(plan);

      return (
        planId !== null &&
        planId === updatingPlanId
      );
    },
    [updatingPlanId],
  );

  /*
   * Loading state
   *
   * Only render the full loading state when there are no
   * existing plans to preserve the current UI while a refresh
   * is happening.
   */
  if (loading && normalizedPlans.length === 0) {
    return (
      <section
        data-testid={testId}
        aria-busy="true"
        aria-live="polite"
        className={cn(
          "flex justify-center items-center w-full min-h-[320px]",
          "px-4 py-10",
          className,
        )}
      >
        <div
          className="
            flex flex-col items-center
            text-center
            gap-3
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
                text-slate-500 text-sm
              "
            >
              Please wait while your plans are loaded.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Error state
   *
   * An error takes precedence over the empty state because
   * an empty collection may simply be the result of a failed
   * request.
   */
  if (error && normalizedPlans.length === 0) {
    return (
      <section
        data-testid={testId}
        role="alert"
        aria-live="assertive"
        className={cn(
          "flex justify-center items-center w-full min-h-[320px]",
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
            {errorMessage ||
              DEFAULT_ERROR_DESCRIPTION}
          </p>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={disabled}
              className={cn(
                "inline-flex justify-center items-center gap-2 mt-5",
                "rounded-xl bg-slate-900 px-4 py-2.5",
                "text-sm font-semibold text-white",
                "shadow-sm transition",
                "hover:bg-slate-800",
                "active:scale-[0.98]",
                "focus:outline-none focus-visible:ring-2",
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
  }

  /*
   * Empty state
   */
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
      <div
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
      </div>
    );
  }

  /*
   * Normal list
   *
   * Existing plans remain visible even when a background
   * refresh is running.
   */
  return (
    <section
      data-testid={testId}
      aria-busy={loading || undefined}
      className={cn(
        "w-full",
        className,
      )}
    >
      {loading && (
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

          <span>Refreshing saving plans...</span>
        </div>
      )}

      {error && normalizedPlans.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-start gap-3 mb-5 rounded-xl",
            "border border-amber-200 bg-amber-50",
            "px-4 py-3",
          )}
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
              {errorMessage}
            </p>
          </div>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={disabled || loading}
              className={cn(
                "px-3 py-1.5 rounded-lg shrink-0",
                "text-sm font-semibold text-amber-900",
                "transition hover:bg-amber-100",
                "focus:outline-none focus-visible:ring-2",
                "focus-visible:ring-amber-600",
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
              )}
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div
        className={cn(
          "gap-4 grid w-full",
          compact
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          gridClassName,
        )}
      >
        {normalizedPlans.map((plan) => {
          const planId = getSavingPlanId(plan);

          /*
           * A valid stable ID is preferred as the React key.
           * If an API response unexpectedly contains a plan
           * without an ID, the index fallback prevents the
           * entire list from crashing.
           */
          const key =
            planId ||
            `saving-plan-${normalizedPlans.indexOf(plan)}`;

          const isSelected =
            Boolean(selectedPlanId) &&
            planId === selectedPlanId;

          const planDisabled =
            getPlanDisabledState(plan);

          const planDeleting =
            getPlanDeletingState(plan);

          const planUpdating =
            getPlanUpdatingState(plan);

          return (
            <SavingPlanCard
              key={key}
              plan={plan}
              onEdit={onEdit ? handleEdit : undefined}
              onDelete={
                onDelete
                  ? handleDelete
                  : undefined
              }
              onView={
                onView
                  ? handleView
                  : undefined
              }
              onPause={
                onPause
                  ? handlePause
                  : undefined
              }
              onResume={
                onResume
                  ? handleResume
                  : undefined
              }
              onSelect={
                onSelect
                  ? handleSelect
                  : undefined
              }
              selected={isSelected}
              disabled={planDisabled}
              deleting={planDeleting}
              updating={planUpdating}
              showActions={showActions}
              showDescription={showDescription}
              showProgress={showProgress}
              compact={compact}
            />
          );
        })}
      </div>

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

SavingPlanList.displayName = "SavingPlanList";

export default memo(SavingPlanList);