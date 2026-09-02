
// pages/.../SavingsChallengesPage.jsx

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  RefreshCw,
  Target,
  Trophy,
  Sparkles,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import SavingsChallengeCard from "./SavingsChallengeCard";
import ChallengeEmptyState from "./ChallengeEmptyState";
import ChallengeDetailsModal from "./ChallengeDetailsModal";
import CreateChallengeModal from "./CreateChallengeModal";
import SavingsSkeleton from "../shared/SavingsSkeleton";
import SavingsErrorState from "../shared/SavingsErrorState";

import useSavingsChallenges from "../../../../hooks/useSavingsChallenges";

import {
  CHALLENGE_STATUS,
} from "../../../../constants/smartSaveConstants";

import {
  normalizeSavingsChallenge,
} from "../../../../utils/smartSave/savingsNormalizers";

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_TITLE = "Savings Challenges";

const DEFAULT_DESCRIPTION =
  "Build consistent saving habits by completing structured challenges.";

const DEFAULT_ERROR =
  "We couldn't load your savings challenges.";

const DEFAULT_LIMIT = 20;
const MAX_SAFE_LIMIT = 100;

const STATUS = Object.freeze({
  ACTIVE: String(CHALLENGE_STATUS?.ACTIVE ?? "active")
    .trim()
    .toLowerCase(),

  PAUSED: String(CHALLENGE_STATUS?.PAUSED ?? "paused")
    .trim()
    .toLowerCase(),

  COMPLETED: String(CHALLENGE_STATUS?.COMPLETED ?? "completed")
    .trim()
    .toLowerCase(),

  CANCELLED: String(CHALLENGE_STATUS?.CANCELLED ?? "cancelled")
    .trim()
    .toLowerCase(),

  DRAFT: String(CHALLENGE_STATUS?.DRAFT ?? "draft")
    .trim()
    .toLowerCase(),
});

/* ============================================================
   HELPERS
============================================================ */

const getEntityId = (entity) => {
  if (entity == null) {
    return null;
  }

  if (
    typeof entity === "string" ||
    typeof entity === "number"
  ) {
    const value = String(entity).trim();
    return value || null;
  }

  const value =
    entity?._id ??
    entity?.id ??
    entity?.challengeId ??
    null;

  if (value == null || value === "") {
    return null;
  }

  return String(value);
};

const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    return error.trim() || DEFAULT_ERROR;
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.data?.error ??
    error?.message ??
    error?.error;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return DEFAULT_ERROR;
};

const normalizeStatus = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getChallengeStatus = (challenge) =>
  normalizeStatus(
    challenge?.status ??
      challenge?.state ??
      STATUS.DRAFT
  );

const getChallengeKey = (challenge, index) => {
  const id = getEntityId(challenge);

  return id
    ? `challenge-${id}`
    : `challenge-${index}`;
};

const sanitizeLimit = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return DEFAULT_LIMIT;
  }

  const numeric = Number(value);

  if (
    !Number.isFinite(numeric) ||
    numeric <= 0
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    Math.floor(numeric),
    MAX_SAFE_LIMIT
  );
};

/* ============================================================
   SECTION HEADER
============================================================ */

const SectionHeader = memo(
  ({
    title,
    description,
    count,
    onCreate,
    onRefresh,
    showCreate,
    showRefresh,
    refreshing,
  }) => {
    return (
      <header
        className="relative bg-white shadow-sm p-5 sm:p-6 lg:p-7 border border-slate-200 rounded-3xl overflow-hidden"
      >
        <div
          className="-top-20 -right-20 absolute bg-blue-100/60 blur-3xl rounded-full w-48 h-48 pointer-events-none"
          aria-hidden="true"
        /
        >

        <div
          className="relative flex lg:flex-row flex-col lg:justify-between lg:items-center gap-6"
        >
          <div
            className="min-w-0"
          >
            <div
              className="flex items-start gap-4"
            >
              <div
                className="flex justify-center items-center bg-blue-50 rounded-2xl ring-1 ring-blue-100 w-12 h-12 text-blue-600 shrink-0"
                aria-hidden="true"
              >
                <Target
                  size={22}
                  strokeWidth={1.8}
                />
              </div>

              <div
                className="min-w-0"
              >
                <div
                  className="flex flex-wrap items-center gap-2"
                >
                  <h1
                    id="savings-challenges-title"
                    className="font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight"
                  >
                    {title}
                  </h1>

                  <span
                    className="inline-flex items-center bg-slate-50 px-2.5 border border-slate-200 rounded-full min-h-6 font-semibold text-slate-600 text-xs"
                  >
                    {count}
                  </span>
                </div>

                {description ? (
                  <p
                    className="mt-2 max-w-2xl text-slate-500 text-sm leading-6"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className="flex sm:flex-row flex-col gap-2 w-full lg:w-auto"
          >
            {showRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-60 shadow-sm px-4 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-11 font-semibold text-slate-700 text-sm transition disabled:cursor-not-allowed"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : undefined
                  }
                  aria-hidden="true"
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            ) : null}

            {showCreate ? (
              <button
                type="button"
                onClick={onCreate}
                className="group inline-flex justify-center items-center gap-2 bg-slate-950 hover:bg-slate-800 shadow-lg shadow-slate-950/10 px-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:ring-offset-2 min-h-11 font-semibold text-white text-sm transition hover:-translate-y-0.5"
              >
                <Plus
                  size={17}
                  className="group-hover:rotate-90 transition-transform"
                  aria-hidden="true"
                /
                >

                New challenge
              </button>
            ) : null}
          </div>
        </div>
      </header>
    );
  }
);

SectionHeader.displayName =
  "SavingsChallengesSectionHeader";

/* ============================================================
   SUMMARY METRIC
============================================================ */

const SummaryMetric = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
    accent = "slate",
  }) => {
    const accentClasses = {
      blue: {
        icon: "bg-blue-50 text-blue-600",
      },
      green: {
        icon: "bg-emerald-50 text-emerald-600",
      },
      amber: {
        icon: "bg-amber-50 text-amber-600",
      },
      violet: {
        icon: "bg-violet-50 text-violet-600",
      },
      slate: {
        icon: "bg-slate-100 text-slate-700",
      },
    };

    const styles =
      accentClasses[accent] ??
      accentClasses.slate;

    return (
      <div
        className="group bg-white shadow-sm hover:shadow-md p-4 sm:p-5 border border-slate-200 rounded-2xl transition hover:-translate-y-0.5"
      >
        <div
          className="flex items-start gap-3"
        >
          <div
            className={`
              flex h-10 w-10
              shrink-0
              items-center justify-center
              rounded-xl
              ${styles.icon}
            `}
            aria-hidden="true"
          >
            <Icon size={18} />
          </div>

          <div
            className="min-w-0"
          >
            <p
              className="font-medium text-slate-500 text-xs"
            >
              {label}
            </p>

            <p
              className="mt-1 font-bold text-slate-950 text-2xl tracking-tight"
            >
              {value}
            </p>

            <p
              className="mt-0.5 text-[11px] text-slate-400"
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

SummaryMetric.displayName =
  "SavingsChallengeSummaryMetric";

/* ============================================================
   REFRESH WARNING
============================================================ */

const RefreshWarning = memo(
  ({
    message,
    refreshing,
    onRetry,
    canRetry,
  }) => (
    <div
      className="flex items-start gap-3 bg-amber-50 p-4 border border-amber-200 rounded-2xl"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex justify-center items-center bg-amber-100 rounded-xl w-9 h-9 text-amber-700 shrink-0"
        aria-hidden="true"
      >
        <AlertCircle size={17} />
      </div>

      <div
        className="flex-1 min-w-0"
      >
        <p
          className="font-semibold text-amber-900 text-sm"
        >
          Your challenge data may be outdated.
        </p>

        <p
          className="mt-1 text-amber-700 text-xs leading-5"
        >
          {message}
        </p>
      </div>

      {canRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={refreshing}
          className="disabled:opacity-50 font-semibold text-amber-800 text-xs underline underline-offset-2 disabled:cursor-not-allowed shrink-0"
        >
          {refreshing
            ? "Retrying..."
            : "Retry"}
        </button>
      ) : null}
    </div>
  )
);

RefreshWarning.displayName =
  "SavingsChallengesRefreshWarning";

/* ============================================================
   PAGE
============================================================ */

const SavingsChallengesPage = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  limit,
  status,
  showHeader = true,
  showCreateButton = true,
  showRefreshButton = true,
  compact = false,
  onCreate,
  onChallengeClick,
  className = "",
}) => {
  /* ==========================================================
     HOOK
  ========================================================== */

  const safeInitialLimit = useMemo(
    () => sanitizeLimit(limit),
    [limit]
  );

  const initialQuery = useMemo(
    () => ({
      page: 1,
      limit: safeInitialLimit,
      ...(status
        ? {
            status,
          }
        : {}),
    }),
    [safeInitialLimit, status]
  );

  const {
    items = [],
    loading = false,
    error = null,
    mutating = false,
    mutationError = null,
    refresh,
    fetchChallenges,
    createChallenge,
    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,
    query,
  } = useSavingsChallenges({
    autoFetch: true,
    initialQuery,
  });

  /* ==========================================================
     LOCAL UI STATE
  ========================================================== */

  const [selectedChallenge, setSelectedChallenge] =
    useState(null);

  const [createModalOpen, setCreateModalOpen] =
    useState(false);

  const mutationLockRef = useRef(false);

  /* ==========================================================
     NORMALIZED CHALLENGES
  ========================================================== */

  const challenges = useMemo(() => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.reduce(
      (result, challenge) => {
        try {
          const normalized =
            normalizeSavingsChallenge(challenge);

          if (normalized) {
            result.push(normalized);
          }
        } catch (normalizationError) {
          console.warn(
            "[SavingsChallengesPage] Failed to normalize challenge:",
            normalizationError
          );
        }

        return result;
      },
      []
    );
  }, [items]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const normalizedStatus = useMemo(
    () =>
      status
        ? normalizeStatus(status)
        : null,
    [status]
  );

  const filteredChallenges = useMemo(() => {
    if (!normalizedStatus) {
      return challenges;
    }

    return challenges.filter(
      (challenge) =>
        getChallengeStatus(challenge) ===
        normalizedStatus
    );
  }, [
    challenges,
    normalizedStatus,
  ]);

  /* ==========================================================
     VISIBLE CHALLENGES
  ========================================================== */

  const visibleChallenges = useMemo(() => {
    if (!safeInitialLimit) {
      return filteredChallenges;
    }

    return filteredChallenges.slice(
      0,
      safeInitialLimit
    );
  }, [
    filteredChallenges,
    safeInitialLimit,
  ]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary = useMemo(() => {
    let active = 0;
    let paused = 0;
    let completed = 0;

    for (const challenge of filteredChallenges) {
      const challengeStatus =
        getChallengeStatus(challenge);

      if (challengeStatus === STATUS.ACTIVE) {
        active += 1;
      }

      if (challengeStatus === STATUS.PAUSED) {
        paused += 1;
      }

      if (
        challengeStatus === STATUS.COMPLETED
      ) {
        completed += 1;
      }
    }

    return {
      total: filteredChallenges.length,
      active,
      paused,
      completed,
    };
  }, [filteredChallenges]);

  /* ==========================================================
     CAPABILITIES
  ========================================================== */

  const canRefresh =
    typeof refresh === "function" ||
    typeof fetchChallenges === "function";

  const canCreate =
    typeof createChallenge === "function";

  const canActivate =
    typeof activateChallenge === "function";

  const canPause =
    typeof pauseChallenge === "function";

  const canResume =
    typeof resumeChallenge === "function";

  const canComplete =
    typeof completeChallenge === "function";

  const canCancel =
    typeof cancelChallenge === "function";

  /* ==========================================================
     LOADING
  ========================================================== */

  const initialLoading =
    loading && challenges.length === 0;

  const refreshing =
    loading && challenges.length > 0;

  /* ==========================================================
     ERROR
  ========================================================== */

  const errorMessage = useMemo(
    () =>
      error
        ? getErrorMessage(error)
        : null,
    [error]
  );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = useCallback(
    async () => {
      if (
        mutationLockRef.current ||
        loading
      ) {
        return;
      }

      try {
        if (typeof refresh === "function") {
          await refresh();
          return;
        }

        if (
          typeof fetchChallenges ===
          "function"
        ) {
          await fetchChallenges(query);
        }
      } catch (refreshError) {
        console.error(
          "[SavingsChallengesPage] Refresh failed:",
          refreshError
        );
      }
    },
    [
      refresh,
      fetchChallenges,
      query,
      loading,
    ]
  );

  /* ==========================================================
     OPEN CREATE MODAL
  ========================================================== */

  const handleOpenCreate = useCallback(() => {
    if (mutationLockRef.current) {
      return;
    }

    if (typeof onCreate === "function") {
      onCreate();
      return;
    }

    setCreateModalOpen(true);
  }, [onCreate]);

  /* ==========================================================
     CLOSE CREATE MODAL
  ========================================================== */

  const handleCloseCreate = useCallback(() => {
    if (mutationLockRef.current) {
      return;
    }

    setCreateModalOpen(false);
  }, []);

  /* ==========================================================
     CREATE CHALLENGE
  ========================================================== */

  const handleCreateChallenge =
    useCallback(
      async (payload) => {
        if (mutationLockRef.current) {
          return;
        }

        if (
          typeof createChallenge !==
          "function"
        ) {
          console.error(
            "[SavingsChallengesPage] createChallenge() is unavailable."
          );
          return;
        }

        mutationLockRef.current = true;

        try {
          await createChallenge(payload);

          /*
           * The hook owns the server refresh.
           * The page does not call refresh again.
           */

          setCreateModalOpen(false);
        } catch (createError) {
          console.error(
            "[SavingsChallengesPage] Failed to create challenge:",
            createError
          );

          throw createError;
        } finally {
          mutationLockRef.current = false;
        }
      },
      [createChallenge]
    );

  /* ==========================================================
     OPEN DETAILS
  ========================================================== */

  const handleChallengeClick =
    useCallback(
      (challenge) => {
        if (
          typeof onChallengeClick ===
          "function"
        ) {
          onChallengeClick(challenge);
          return;
        }

        setSelectedChallenge(challenge);
      },
      [onChallengeClick]
    );

  /* ==========================================================
     CLOSE DETAILS
  ========================================================== */

  const handleCloseDetails =
    useCallback(() => {
      if (mutationLockRef.current) {
        return;
      }

      setSelectedChallenge(null);
    }, []);

  /* ==========================================================
     GENERIC MUTATION
  ========================================================== */

  const executeMutation = useCallback(
    async (
      mutation,
      challenge,
      closeDetails = false
    ) => {
      const challengeId =
        getEntityId(challenge);

      if (
        !challengeId ||
        typeof mutation !== "function" ||
        mutationLockRef.current
      ) {
        return;
      }

      mutationLockRef.current = true;

      try {
        const result =
          await mutation(challengeId);

        if (closeDetails) {
          setSelectedChallenge(null);
        }

        return result;
      } catch (mutationError) {
        console.error(
          "[SavingsChallengesPage] Challenge mutation failed:",
          mutationError
        );

        throw mutationError;
      } finally {
        mutationLockRef.current = false;
      }
    },
    []
  );

  /* ==========================================================
     ACTION HANDLERS
  ========================================================== */

  const handleActivate = useCallback(
    (challenge) =>
      executeMutation(
        activateChallenge,
        challenge
      ),
    [
      executeMutation,
      activateChallenge,
    ]
  );

  const handlePause = useCallback(
    (challenge) =>
      executeMutation(
        pauseChallenge,
        challenge
      ),
    [
      executeMutation,
      pauseChallenge,
    ]
  );

  const handleResume = useCallback(
    (challenge) =>
      executeMutation(
        resumeChallenge,
        challenge
      ),
    [
      executeMutation,
      resumeChallenge,
    ]
  );

  const handleComplete = useCallback(
    (challenge) =>
      executeMutation(
        completeChallenge,
        challenge,
        true
      ),
    [
      executeMutation,
      completeChallenge,
    ]
  );

  const handleCancel = useCallback(
    (challenge) =>
      executeMutation(
        cancelChallenge,
        challenge,
        true
      ),
    [
      executeMutation,
      cancelChallenge,
    ]
  );

  /* ==========================================================
     VIEW FLAGS
  ========================================================== */

  const hasChallenges =
    visibleChallenges.length > 0;

  const showInitialError =
    Boolean(error) &&
    !initialLoading &&
    challenges.length === 0;

  const showEmpty =
    !initialLoading &&
    !showInitialError &&
    !hasChallenges;

  /* ==========================================================
     HEADER
  ========================================================== */

  const header = showHeader ? (
    <SectionHeader
      title={title}
      description={description}
      count={summary.total}
      onCreate={handleOpenCreate}
      onRefresh={handleRefresh}
      showCreate={
        showCreateButton &&
        (
          canCreate ||
          typeof onCreate === "function"
        )
      }
      showRefresh={
        showRefreshButton &&
        canRefresh
      }
      refreshing={refreshing}
    />
  ) : null;

  /* ==========================================================
     CREATE MODAL
  ========================================================== */

  const createModal = (
    <CreateChallengeModal
      open={createModalOpen}
      onClose={handleCloseCreate}
      onSubmit={handleCreateChallenge}
      creating={mutating}
      error={mutationError}
    />
  );

  /* ==========================================================
     INITIAL LOADING
  ========================================================== */

  if (initialLoading) {
    return (
      <>
        <section
          className={`
            w-full
            space-y-5
            ${className}
          `}
          aria-labelledby="savings-challenges-title"
          aria-busy="true"
        >
          {header}

          <div
            className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          >
            <SavingsSkeleton
              count={compact ? 2 : 3}
            />
          </div>
        </section>

        {createModal}
      </>
    );
  }

  /* ==========================================================
     INITIAL ERROR
  ========================================================== */

  if (showInitialError) {
    return (
      <>
        <section
          className={`
            w-full
            space-y-5
            ${className}
          `}
          aria-labelledby="savings-challenges-title"
        >
          {header}

          <SavingsErrorState
            error={errorMessage}
            onRetry={
              canRefresh
                ? handleRefresh
                : undefined
            }
            retrying={refreshing}
          />
        </section>

        {createModal}
      </>
    );
  }

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  if (showEmpty) {
    return (
      <>
        <section
          className={`
            w-full
            space-y-5
            ${className}
          `}
          aria-labelledby="savings-challenges-title"
        >
          {header}

          <ChallengeEmptyState
            onCreate={
              showCreateButton &&
              (
                canCreate ||
                typeof onCreate === "function"
              )
                ? handleOpenCreate
                : undefined
            }
          />
        </section>

        {createModal}
      </>
    );
  }

  /* ==========================================================
     MAIN PAGE
  ========================================================== */

  return (
    <>
      <section
        className={`
          w-full
          space-y-6
          ${className}
        `}
        aria-labelledby="savings-challenges-title"
        aria-busy={refreshing}
      >
        {header}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section
          className="gap-3 sm:gap-4 grid grid-cols-2 lg:grid-cols-4"
          aria-label="Savings challenge summary"
        >
          <SummaryMetric
            icon={Target}
            label="Total"
            value={summary.total}
            description="Available challenges"
            accent="blue"
          />

          <SummaryMetric
            icon={CheckCircle2}
            label="Active"
            value={summary.active}
            description="Currently running"
            accent="green"
          />

          <SummaryMetric
            icon={Clock3}
            label="Paused"
            value={summary.paused}
            description="Temporarily paused"
            accent="amber"
          />

          <SummaryMetric
            icon={Trophy}
            label="Completed"
            value={summary.completed}
            description="Successfully finished"
            accent="violet"
          />
        </section>

        {/* ==================================================
            BACKGROUND ERROR
        ================================================== */}

        {errorMessage ? (
          <RefreshWarning
            message={errorMessage}
            refreshing={refreshing}
            onRetry={handleRefresh}
            canRetry={canRefresh}
          />
        ) : null}

        {/* ==================================================
            LIST INTRO
        ================================================== */}

        <div
          className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-3"
        >
          <div>
            <div
              className="flex items-center gap-2"
            >
              <Sparkles
                size={17}
                className="text-blue-600"
                aria-hidden="true"
              /
              >

              <h2
                className="font-bold text-slate-950 text-lg"
              >
                Your challenges
              </h2>
            </div>

            <p
              className="mt-1 text-slate-500 text-sm"
            >
              Stay consistent and make progress
              toward your savings goals.
            </p>
          </div>

          <span
            className="inline-flex items-center gap-1 bg-white shadow-sm px-3 py-1.5 border border-slate-200 rounded-full w-fit font-semibold text-slate-600 text-xs"
          >
            {visibleChallenges.length}

            <span
              className="text-slate-400"
            >
              {visibleChallenges.length === 1
                ? "challenge"
                : "challenges"}
            </span>

            {safeInitialLimit &&
            filteredChallenges.length >
              safeInitialLimit ? (
              <>
                <ChevronRight
                  size={12}
                  aria-hidden="true"
                />

                <span>
                  showing {safeInitialLimit}
                </span>
              </>
            ) : null}
          </span>
        </div>

        {/* ==================================================
            CHALLENGE GRID
        ================================================== */}

        <div
          className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        >
          {visibleChallenges.map(
            (challenge, index) => (
              <div
                key={getChallengeKey(
                  challenge,
                  index
                )}
                className="min-w-0"
              >
                <SavingsChallengeCard
                  challenge={challenge}
                  compact={compact}
                  onView={
                    handleChallengeClick
                  }
                  onActivate={
                    canActivate
                      ? handleActivate
                      : undefined
                  }
                  onPause={
                    canPause
                      ? handlePause
                      : undefined
                  }
                  onResume={
                    canResume
                      ? handleResume
                      : undefined
                  }
                  onComplete={
                    canComplete
                      ? handleComplete
                      : undefined
                  }
                  onCancel={
                    canCancel
                      ? handleCancel
                      : undefined
                  }
                />
              </div>
            )
          )}
        </div>

        {/* ==================================================
            BACKGROUND REFRESH
        ================================================== */}

        {refreshing ? (
          <div
            className="flex justify-center items-center gap-2 pt-1 text-slate-400 text-xs"
            role="status"
            aria-live="polite"
          >
            <RefreshCw
              size={13}
              className="animate-spin"
              aria-hidden="true"
            /
            >

            Updating your savings challenges...
          </div>
        ) : null}

        {/* ==================================================
            MUTATION STATUS
        ================================================== */}

        {mutating ? (
          <span
            className="sr-only"
          >
            Updating savings challenge...
          </span>
        ) : null}
      </section>

      {/* ====================================================
          CREATE MODAL
      ==================================================== */}

      {createModal}

      {/* ====================================================
          DETAILS MODAL
      ==================================================== */}

      <ChallengeDetailsModal
        open={Boolean(selectedChallenge)}
        challenge={selectedChallenge}
        onClose={handleCloseDetails}
        onActivate={
          selectedChallenge && canActivate
            ? handleActivate
            : undefined
        }
        onPause={
          selectedChallenge && canPause
            ? handlePause
            : undefined
        }
        onResume={
          selectedChallenge && canResume
            ? handleResume
            : undefined
        }
        onComplete={
          selectedChallenge && canComplete
            ? handleComplete
            : undefined
        }
        onCancel={
          selectedChallenge && canCancel
            ? handleCancel
            : undefined
        }
      />
    </>
  );
};

SavingsChallengesPage.displayName =
  "SavingsChallengesPage";

export default memo(
  SavingsChallengesPage
);
