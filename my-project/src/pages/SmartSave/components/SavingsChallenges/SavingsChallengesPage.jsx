// pages/.../SavingsChallengesPage.jsx

import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Plus,
  RefreshCw,
  Target,
} from "lucide-react";

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

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE = "Savings Challenges";

const DEFAULT_DESCRIPTION =
  "Build consistent saving habits by completing structured challenges.";

const DEFAULT_ERROR =
  "Unable to load your savings challenges.";

const DEFAULT_SKELETON_COUNT = 3;

const COMPACT_SKELETON_COUNT = 2;

/* =========================================================
   HELPERS
========================================================= */

/**
 * Safely resolve an entity identifier.
 *
 * Supports:
 * - MongoDB _id
 * - normalized id
 * - challengeId
 */
const getEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  if (typeof entity === "string") {
    return entity;
  }

  return (
    entity?._id ??
    entity?.id ??
    entity?.challengeId ??
    null
  );
};

/**
 * Safely resolve a collection from supported API
 * response envelopes.
 *
 * The hook/service should ideally already expose a
 * normalized collection. This function is only a
 * defensive presentation boundary.
 */
const resolveCollection = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.challenges)) {
    return value.challenges;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

/**
 * Convert an unknown error into a user-safe message.
 */
const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    DEFAULT_ERROR
  );
};

/**
 * Normalize challenge status.
 */
const getChallengeStatus = (challenge) =>
  String(
    challenge?.status ??
      CHALLENGE_STATUS?.DRAFT ??
      "draft"
  ).toLowerCase();

/**
 * Filter challenges by status without mutating
 * the original collection.
 */
const filterChallenges = (
  challenges,
  status
) => {
  if (!status) {
    return challenges;
  }

  const normalizedStatus =
    String(status).toLowerCase();

  return challenges.filter(
    (challenge) =>
      getChallengeStatus(challenge) ===
      normalizedStatus
  );
};

/**
 * Create a defensive React key.
 *
 * Prefer a real backend identifier.
 */
const getChallengeKey = (challenge, index) => {
  const id = getEntityId(challenge);

  if (id) {
    return String(id);
  }

  const name =
    challenge?.name ??
    challenge?.title ??
    "challenge";

  const startDate =
    challenge?.startDate ??
    challenge?.createdAt ??
    "";

  return `${name}-${startDate}-${index}`;
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = memo(
  ({
    title,
    description,
    count,
    showCreateButton,
    showRefreshButton,
    onCreate,
    onRefresh,
    refreshing,
  }) => {
    return (
      <header
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-start
          gap-4
        "
      >
        {/* ---------------------------------------------
            TITLE
        --------------------------------------------- */}

        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-2
            "
          >
            <div
              className="
                flex justify-center items-center
                w-9 h-9
                text-blue-600
                bg-blue-50
                rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              <Target size={18} />
            </div>

            <h1
              className="
                min-w-0
                font-bold text-slate-900 text-lg sm:text-xl truncate
                tracking-tight
              "
            >
              {title}
            </h1>

            {typeof count === "number" && (
              <span
                className="
                  inline-flex justify-center items-center
                  min-w-6 h-6
                  px-2
                  font-semibold text-[11px] text-slate-600
                  bg-slate-100
                  rounded-full
                  shrink-0
                "
                aria-label={`${count} challenges`}
              >
                {count}
              </span>
            )}
          </div>

          {description && (
            <p
              className="
                max-w-2xl
                mt-2
                text-slate-500 text-xs sm:text-sm leading-5
              "
            >
              {description}
            </p>
          )}
        </div>

        {/* ---------------------------------------------
            ACTIONS
        --------------------------------------------- */}

        <div
          className="
            flex items-center
            gap-2 shrink-0
          "
        >
          {showRefreshButton && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label={
                refreshing
                  ? "Refreshing savings challenges"
                  : "Refresh savings challenges"
              }
              title="Refresh challenges"
              className="
                inline-flex justify-center items-center
                w-10 h-10
                text-slate-500 hover:text-slate-700
                bg-white hover:bg-slate-50
                border border-slate-200 hover:border-slate-300 rounded-xl
                focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                disabled:opacity-50 shadow-sm transition
                disabled:cursor-not-allowed
              "
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
            </button>
          )}

          {showCreateButton && (
            <button
              type="button"
              onClick={onCreate}
              className="
                inline-flex justify-center items-center
                min-h-10
                px-4 py-2
                font-semibold text-white text-xs
                bg-slate-900 hover:bg-slate-800
                rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                shadow-sm transition
                gap-2
              "
            >
              <Plus
                size={15}
                aria-hidden="true"
              />

              New Challenge
            </button>
          )}
        </div>
      </header>
    );
  }
);

SectionHeader.displayName =
  "SavingsChallengesSectionHeader";

/* =========================================================
   PAGE
========================================================= */

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
  /* =======================================================
     DATA SOURCE
  ======================================================= */

  /*
   * IMPORTANT:
   *
   * This is the ONLY component in this feature that owns
   * useSavingsChallenges().
   *
   * Child components must remain presentation/action
   * components and must not independently call the hook.
   */
  const challengeState =
    useSavingsChallenges() ?? {};

  const {
    challenges: hookChallenges,
    data,

    loading = false,
    isLoading = false,

    error,

    refreshing = false,
    isRefreshing: hookIsRefreshing = false,

    fetchChallenges,
    refetch,

    createChallenge,

    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,
  } = challengeState;

  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const challenges = useMemo(() => {
    const source =
      hookChallenges ??
      data ??
      [];

    const collection =
      resolveCollection(source);

    return collection
      .map((challenge) =>
        normalizeSavingsChallenge(
          challenge
        )
      )
      .filter(Boolean);
  }, [
    hookChallenges,
    data,
  ]);

  /* =======================================================
     LOADING / REFRESHING
  ======================================================= */

  const isInitialLoading =
    Boolean(
      loading ||
        isLoading
    ) &&
    challenges.length === 0;

  const isRefreshing =
    Boolean(
      refreshing ||
        hookIsRefreshing
    );

  /* =======================================================
     ERROR
  ======================================================= */

  const normalizedError =
    useMemo(
      () =>
        error
          ? getErrorMessage(error)
          : null,
      [error]
    );

  const hasError =
    Boolean(normalizedError);

  /* =======================================================
     FILTERING
  ======================================================= */

  const filteredChallenges =
    useMemo(
      () =>
        filterChallenges(
          challenges,
          status
        ),
      [
        challenges,
        status,
      ]
    );

  const visibleChallenges =
    useMemo(() => {
      if (
        Number.isInteger(limit) &&
        limit > 0
      ) {
        return filteredChallenges.slice(
          0,
          limit
        );
      }

      return filteredChallenges;
    }, [
    filteredChallenges,
    limit,
  ]);

  const challengeCount =
    filteredChallenges.length;

  const hasChallenges =
    visibleChallenges.length > 0;

  /* =======================================================
     MODAL STATE
  ======================================================= */

  const [
    selectedChallenge,
    setSelectedChallenge,
  ] = useState(null);

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  /* =======================================================
     CREATE MODAL
  ======================================================= */

  const handleOpenCreate =
    useCallback(() => {
      if (typeof onCreate === "function") {
        onCreate();
        return;
      }

      setIsCreateModalOpen(true);
    }, [
      onCreate,
    ]);

  const handleCloseCreate =
    useCallback(() => {
      setIsCreateModalOpen(false);
    }, []);

  /* =======================================================
     CREATE CHALLENGE
  ======================================================= */

  const handleCreateChallenge =
    useCallback(
      async (payload) => {
        if (
          typeof createChallenge !==
          "function"
        ) {
          return undefined;
        }

        const result =
          await createChallenge(payload);

        /*
         * Close only after successful mutation.
         *
         * If createChallenge throws, the modal remains
         * open so the user can correct/retry the form.
         */
        setIsCreateModalOpen(false);

        return result;
      },
      [
        createChallenge,
      ]
    );

  /* =======================================================
     CHALLENGE DETAILS
  ======================================================= */

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
      [
        onChallengeClick,
      ]
    );

  const handleCloseDetails =
    useCallback(() => {
      setSelectedChallenge(null);
    }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(() => {
      if (
        typeof refetch === "function"
      ) {
        return refetch();
      }

      if (
        typeof fetchChallenges ===
        "function"
      ) {
        return fetchChallenges();
      }

      return undefined;
    }, [
      refetch,
      fetchChallenges,
    ]);

  /* =======================================================
     MUTATION HELPERS
  ======================================================= */

  const handleActivate =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(challenge);

        if (
          !id ||
          typeof activateChallenge !==
            "function"
        ) {
          return undefined;
        }

        return activateChallenge(id);
      },
      [
        activateChallenge,
      ]
    );

  const handlePause =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(challenge);

        if (
          !id ||
          typeof pauseChallenge !==
            "function"
        ) {
          return undefined;
        }

        return pauseChallenge(id);
      },
      [
        pauseChallenge,
      ]
    );

  const handleResume =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(challenge);

        if (
          !id ||
          typeof resumeChallenge !==
            "function"
        ) {
          return undefined;
        }

        return resumeChallenge(id);
      },
      [
        resumeChallenge,
      ]
    );

  const handleComplete =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(challenge);

        if (
          !id ||
          typeof completeChallenge !==
            "function"
        ) {
          return undefined;
        }

        return completeChallenge(id);
      },
      [
        completeChallenge,
      ]
    );

  const handleCancel =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(challenge);

        if (
          !id ||
          typeof cancelChallenge !==
            "function"
        ) {
          return undefined;
        }

        return cancelChallenge(id);
      },
      [
        cancelChallenge,
      ]
    );

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const canRefresh =
    typeof refetch === "function" ||
    typeof fetchChallenges ===
      "function";

  const canCreate =
    typeof createChallenge ===
    "function";

  const canActivate =
    typeof activateChallenge ===
    "function";

  const canPause =
    typeof pauseChallenge ===
    "function";

  const canResume =
    typeof resumeChallenge ===
    "function";

  const canComplete =
    typeof completeChallenge ===
    "function";

  const canCancel =
    typeof cancelChallenge ===
    "function";

  /* =======================================================
     SHARED HEADER
  ======================================================= */

  const header = showHeader ? (
    <SectionHeader
      title={title}
      description={description}
      count={challengeCount}
      showCreateButton={
        showCreateButton &&
        (canCreate || typeof onCreate === "function")
      }
      showRefreshButton={
        showRefreshButton &&
        canRefresh
      }
      onCreate={
        handleOpenCreate
      }
      onRefresh={
        handleRefresh
      }
      refreshing={
        isRefreshing
      }
    />
  ) : null;

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (isInitialLoading) {
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
            className="
              grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
              gap-4
            "
          >
            <SavingsSkeleton
              count={
                compact
                  ? COMPACT_SKELETON_COUNT
                  : DEFAULT_SKELETON_COUNT
              }
            />
          </div>
        </section>

        <CreateChallengeModal
          open={isCreateModalOpen}
          onClose={handleCloseCreate}
          onSubmit={
            handleCreateChallenge
          }
        />
      </>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (
    hasError &&
    challenges.length === 0
  ) {
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
            error={normalizedError}
            onRetry={handleRefresh}
            retrying={isRefreshing}
          />
        </section>

        <CreateChallengeModal
          open={isCreateModalOpen}
          onClose={handleCloseCreate}
          onSubmit={
            handleCreateChallenge
          }
        />
      </>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!hasChallenges) {
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
              showCreateButton
                ? handleOpenCreate
                : undefined
            }
          />
        </section>

        <CreateChallengeModal
          open={isCreateModalOpen}
          onClose={handleCloseCreate}
          onSubmit={
            handleCreateChallenge
          }
        />
      </>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

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
        {/* =============================================
            HEADER
        ============================================== */}

        {header}

        {/* =============================================
            NON-BLOCKING ERROR
        ============================================== */}

        {hasError && (
          <div
            className="
              flex items-start
              px-4 py-3
              text-amber-800 text-xs
              bg-amber-50
              border border-amber-200 rounded-xl
              gap-3
            "
            role="status"
            aria-live="polite"
          >
            <AlertCircle
              size={16}
              className="
                mt-0.5
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
                  font-semibold
                "
              >
                Challenges could not be fully refreshed.
              </p>

              <p
                className="
                  mt-0.5
                  text-amber-700
                "
              >
                {normalizedError}
              </p>
            </div>

            {canRefresh && (
              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  isRefreshing
                }
                className="
                  font-semibold underline underline-offset-2 hover:no-underline
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  shrink-0
                "
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* =============================================
            CHALLENGE GRID
        ============================================== */}

        <div
          className="
            grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
            gap-4
          "
        >
          {visibleChallenges.map(
            (
              challenge,
              index
            ) => (
              <SavingsChallengeCard
                key={getChallengeKey(
                  challenge,
                  index
                )}
                challenge={
                  challenge
                }
                compact={
                  compact
                }
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
            )
          )}
        </div>

        {/* =============================================
            BACKGROUND REFRESH INDICATOR
        ============================================== */}

        {isRefreshing && (
          <div
            className="
              flex justify-center items-center
              pt-1
              text-slate-400 text-xs
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

            Updating challenges...
          </div>
        )}
      </section>

      {/* =================================================
          CREATE MODAL
      ================================================= */}

      <CreateChallengeModal
        open={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSubmit={
          handleCreateChallenge
        }
      />

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      <ChallengeDetailsModal
        open={
          Boolean(
            selectedChallenge
          )
        }
        challenge={
          selectedChallenge
        }
        onClose={
          handleCloseDetails
        }
        onActivate={
          selectedChallenge &&
          canActivate
            ? handleActivate
            : undefined
        }
        onPause={
          selectedChallenge &&
          canPause
            ? handlePause
            : undefined
        }
        onResume={
          selectedChallenge &&
          canResume
            ? handleResume
            : undefined
        }
        onComplete={
          selectedChallenge &&
          canComplete
            ? handleComplete
            : undefined
        }
        onCancel={
          selectedChallenge &&
          canCancel
            ? handleCancel
            : undefined
        }
      />
    </>
  );
};

/* =========================================================
   MEMOIZATION
========================================================= */

export default memo(
  SavingsChallengesPage
);