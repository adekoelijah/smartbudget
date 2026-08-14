
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
   DEFAULTS
========================================================= */

const DEFAULT_TITLE =
  "Savings Challenges";

const DEFAULT_DESCRIPTION =
  "Build consistent saving habits by completing structured challenges.";

const DEFAULT_ERROR =
  "Unable to load your savings challenges.";

/* =========================================================
   INTERNAL HELPERS
========================================================= */

/**
 * Safely resolve an entity identifier.
 *
 * Supports both MongoDB documents and normalized
 * frontend entities.
 */
const getEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  if (
    typeof entity === "string"
  ) {
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
 * Resolve a collection from common API envelopes.
 *
 * The service/hook layer should normally provide a
 * normalized array, but this boundary prevents an
 * unexpected response shape from breaking the page.
 */
const resolveCollection = (
 value
) => {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value?.data)
  ) {
    return value.data;
  }

  if (
    Array.isArray(
      value?.challenges
    )
  ) {
    return value.challenges;
  }

  if (
    Array.isArray(value?.items)
  ) {
    return value.items;
  }

  if (
    Array.isArray(
      value?.results
    )
  ) {
    return value.results;
  }

  return [];
};

/**
 * Normalize backend/hook errors for presentation.
 */
const getErrorMessage = (
  error
) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    DEFAULT_ERROR
  );
};

/**
 * Resolve a challenge status safely.
 */
const getChallengeStatus = (
  challenge
) =>
  String(
    challenge?.status ??
      CHALLENGE_STATUS?.DRAFT ??
      "draft"
  ).toLowerCase();

/**
 * Apply optional status filtering without mutating
 * the source collection.
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
      getChallengeStatus(
        challenge
      ) === normalizedStatus
  );
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
    refreshing = false,
  }) => {
    return (
      <header
        className="
          flex flex-col sm:flex-row sm:justify-between sm:items-start
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
              flex items-center
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
            >
              <Target
                size={18}
                aria-hidden="true"
              />
            </div>

            <h2
              className="
                font-bold text-slate-900 text-lg truncate tracking-tight
              "
            >
              {title}
            </h2>

            {typeof count ===
              "number" && (
              <span
                className="
                  px-2 py-0.5
                  font-semibold text-[11px] text-slate-600
                  bg-slate-100
                  rounded-full
                  shrink-0
                "
              >
                {count}
              </span>
            )}
          </div>

          {description && (
            <p
              className="
                max-w-2xl
                mt-1
                text-slate-500 text-sm leading-5
              "
            >
              {description}
            </p>
          )}
        </div>

        <div
          className="
            flex items-center
            gap-2 shrink-0
          "
        >
          {showRefreshButton && (
            <button
              type="button"
              onClick={
                onRefresh
              }
              disabled={
                refreshing
              }
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
                disabled:opacity-60 shadow-sm transition
                disabled:cursor-not-allowed
              "
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
                aria-hidden="true"
              />
            </button>
          )}

          {showCreateButton && (
            <button
              type="button"
              onClick={
                onCreate
              }
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
  "SectionHeader";

/* =========================================================
   COMPONENT
========================================================= */

const SavingsChallengeSection = ({
  title =
    DEFAULT_TITLE,

  description =
    DEFAULT_DESCRIPTION,

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
     HOOK
  ======================================================= */

  const challengeHook =
    useSavingsChallenges();

  const {
    challenges:
      hookChallenges,

    data,

    loading =
      false,

    isLoading =
      false,

    error,

    refreshing =
      false,

    isRefreshing: hookIsRefreshing = false,

    fetchChallenges,

    refetch,

    createChallenge,

    activateChallenge,

    pauseChallenge,

    resumeChallenge,

    completeChallenge,

    cancelChallenge,
  } =
    challengeHook ?? {};

  /* =======================================================
     NORMALIZED STATE
  ======================================================= */

  const challenges =
    useMemo(() => {
      const source =
        hookChallenges ??
        data ??
        [];

      return resolveCollection(
        source
      )
        .map(
          (
            challenge
          ) =>
            normalizeSavingsChallenge(
              challenge
            )
        )
        .filter(Boolean);
    }, [
      hookChallenges,
      data,
    ]);

  const isLoadingState =
    Boolean(
      loading ||
        isLoading
    );

  const isRefreshing = Boolean(
  refreshing ||
    hookIsRefreshing
);

  const normalizedError =
    useMemo(
      () =>
        error
          ? getErrorMessage(
              error
            )
          : null,
      [error]
    );

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
        Number.isInteger(
          limit
        ) &&
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
     CREATE
  ======================================================= */

  const handleOpenCreate =
    useCallback(() => {
      if (
        typeof onCreate ===
        "function"
      ) {
        onCreate();
        return;
      }

      setIsCreateModalOpen(
        true
      );
    }, [
      onCreate,
    ]);

  const handleCloseCreate =
    useCallback(() => {
      setIsCreateModalOpen(
        false
      );
    }, []);

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
          await createChallenge(
            payload
          );

        setIsCreateModalOpen(
          false
        );

        return result;
      },
      [
        createChallenge,
      ]
    );

  /* =======================================================
     VIEW CHALLENGE
  ======================================================= */

  const handleChallengeClick =
    useCallback(
      (challenge) => {
        if (
          typeof onChallengeClick ===
          "function"
        ) {
          onChallengeClick(
            challenge
          );
          return;
        }

        setSelectedChallenge(
          challenge
        );
      },
      [
        onChallengeClick,
      ]
    );

  const handleCloseDetails =
    useCallback(() => {
      setSelectedChallenge(
        null
      );
    }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(() => {
      if (
        typeof refetch ===
        "function"
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
     CHALLENGE MUTATIONS
  ======================================================= */

  const handleActivate =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(
            challenge
          );

        if (
          !id ||
          typeof activateChallenge !==
            "function"
        ) {
          return undefined;
        }

        return activateChallenge(
          id
        );
      },
      [
        activateChallenge,
      ]
    );

  const handlePause =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(
            challenge
          );

        if (
          !id ||
          typeof pauseChallenge !==
            "function"
        ) {
          return undefined;
        }

        return pauseChallenge(
          id
        );
      },
      [
        pauseChallenge,
      ]
    );

  const handleResume =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(
            challenge
          );

        if (
          !id ||
          typeof resumeChallenge !==
            "function"
        ) {
          return undefined;
        }

        return resumeChallenge(
          id
        );
      },
      [
        resumeChallenge,
      ]
    );

  const handleComplete =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(
            challenge
          );

        if (
          !id ||
          typeof completeChallenge !==
            "function"
        ) {
          return undefined;
        }

        return completeChallenge(
          id
        );
      },
      [
        completeChallenge,
      ]
    );

  const handleCancel =
    useCallback(
      async (challenge) => {
        const id =
          getEntityId(
            challenge
          );

        if (
          !id ||
          typeof cancelChallenge !==
            "function"
        ) {
          return undefined;
        }

        return cancelChallenge(
          id
        );
      },
      [
        cancelChallenge,
      ]
    );

  /* =======================================================
     SHARED HEADER
  ======================================================= */

  const header =
    showHeader ? (
      <SectionHeader
        title={title}
        description={
          description
        }
        count={
          filteredChallenges.length
        }
        showCreateButton={
          showCreateButton
        }
        showRefreshButton={
          showRefreshButton &&
          (
            typeof refetch ===
              "function" ||
            typeof fetchChallenges ===
              "function"
          )
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

  if (
    isLoadingState &&
    challenges.length === 0
  ) {
    return (
      <>
        <section
          className={`
            space-y-4
            ${className}
          `}
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
                  ? 2
                  : 3
              }
            />
          </div>
        </section>

        <CreateChallengeModal
          open={
            isCreateModalOpen
          }
          onClose={
            handleCloseCreate
          }
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
    normalizedError &&
    challenges.length === 0
  ) {
    return (
      <>
        <section
          className={`
            space-y-4
            ${className}
          `}
        >
          {header}

          <SavingsErrorState
            error={
              normalizedError
            }
            onRetry={
              handleRefresh
            }
            retrying={
              isRefreshing
            }
          />
        </section>

        <CreateChallengeModal
          open={
            isCreateModalOpen
          }
          onClose={
            handleCloseCreate
          }
          onSubmit={
            handleCreateChallenge
          }
        />
      </>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (
    visibleChallenges.length ===
    0
  ) {
    return (
      <>
        <section
          className={`
            space-y-4
            ${className}
          `}
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
          open={
            isCreateModalOpen
          }
          onClose={
            handleCloseCreate
          }
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
          space-y-4
          ${className}
        `}
      >
        {header}

        {/* =============================================
            NON-BLOCKING REFRESH ERROR
        ============================================== */}

        {normalizedError && (
          <div
            className="
              flex items-center
              px-4 py-3
              text-amber-800 text-xs
              bg-amber-50
              border border-amber-200 rounded-xl
              gap-2
            "
            role="status"
            aria-live="polite"
          >
            <AlertCircle
              size={15}
              className="
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <span>
              Some challenge data could
              not be refreshed.
            </span>

            {(
              typeof refetch ===
                "function" ||
              typeof fetchChallenges ===
                "function"
            ) && (
              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  isRefreshing
                }
                className="
                  ml-auto
                  font-semibold underline underline-offset-2
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
            (challenge) => {
              const challengeId =
                getEntityId(
                  challenge
                );

              /*
               * A stable backend ID is required.
               *
               * Do NOT use Math.random() as a React key.
               */
              const key =
                challengeId ??
                `challenge-${challenge?.name ?? "item"}-${challenge?.startDate ?? ""}`;

              return (
                <SavingsChallengeCard
                  key={key}
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
                    typeof activateChallenge ===
                    "function"
                      ? handleActivate
                      : undefined
                  }
                  onPause={
                    typeof pauseChallenge ===
                    "function"
                      ? handlePause
                      : undefined
                  }
                  onResume={
                    typeof resumeChallenge ===
                    "function"
                      ? handleResume
                      : undefined
                  }
                  onComplete={
                    typeof completeChallenge ===
                    "function"
                      ? handleComplete
                      : undefined
                  }
                  onCancel={
                    typeof cancelChallenge ===
                    "function"
                      ? handleCancel
                      : undefined
                  }
                />
              );
            }
          )}
        </div>

        {/* =============================================
            BACKGROUND REFRESH
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
          CREATE CHALLENGE MODAL
      ================================================= */}

      <CreateChallengeModal
        open={
          isCreateModalOpen
        }
        onClose={
          handleCloseCreate
        }
        onSubmit={
          handleCreateChallenge
        }
      />

      {/* =================================================
          CHALLENGE DETAILS MODAL
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
          typeof activateChallenge ===
            "function"
            ? handleActivate
            : undefined
        }
        onPause={
          selectedChallenge &&
          typeof pauseChallenge ===
            "function"
            ? handlePause
            : undefined
        }
        onResume={
          selectedChallenge &&
          typeof resumeChallenge ===
            "function"
            ? handleResume
            : undefined
        }
        onComplete={
          selectedChallenge &&
          typeof completeChallenge ===
            "function"
            ? handleComplete
            : undefined
        }
        onCancel={
          selectedChallenge &&
          typeof cancelChallenge ===
            "function"
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
  SavingsChallengeSection
);

