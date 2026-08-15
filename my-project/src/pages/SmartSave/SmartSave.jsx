
import {
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import useSmartSave from "../../hooks/useSmartSave";

import SmartSaveHeader from "../SmartSave/components/SmartSaveHeader";
import SavingsOverview from "../SmartSave/components/SavingsOverview";
import EmergencyFundCard from "./components/EmergencyFund/EmergencyFundCard";

import SavingsGoalSection from "../SmartSave/components/SavingsGoals/SavingsGoalsSection";
import SavingsChallengeSection from "../SmartSave/components/SavingsChallenges/SavingsChallengesSection";
import SavingsActivitySection from "../SmartSave/components/SavingsActivity/SavingsActivitySection";
import SavingsInsightsSection from "../SmartSave/components/SavingsInsights/SavingsInsightsSection";
import SavingsStrategiesSection from "../SmartSave/components/SavingsStrategies/SavingsStrategiesSection";
import EmergencyFundProgress from "../SmartSave/components/EmergencyFund/EmergencyFundProgress"

import SavingsForecastCard from "../SmartSave/components/SavingsForecast/SavingsForecastCard";
import SavingsHealthScore from "../SmartSave/components/SavingsHealthScore";
import SafeToSaveCard from "../SmartSave/components/SafeToSaveCard";






import SavingsEmptyState from "../SmartSave/components/shared/SavingsEmptyState";

import CreateSavingsGoalModal from "../SmartSave/components/SavingsGoals/CreateSavingsGoalModal";
import CreateChallengeModal from "../SmartSave/components/SavingsChallenges/ChallengeDetailsModal";
import SavingsSkeleton from "../SmartSave/components/shared/SavingsSkeleton";
import SavingsErrorState from "../SmartSave/components/shared/SavingsErrorState";

import {
  DEFAULT_CURRENCY,
} from "../../constants/smartSaveConstants";

/* =========================================================
   SAFE HELPERS
========================================================= */

const isObject = (
  value
) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const toArray = (
  value
) => {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    Array.isArray(
      value?.data
    )
  ) {
    return value.data;
  }

  if (
    Array.isArray(
      value?.items
    )
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

const resolveData = (
  data
) => {
  if (
    !isObject(data)
  ) {
    return {};
  }

  /*
   * Preserve the established
   * SmartSave response contract
   * while supporting common API
   * response envelopes.
   */
  if (
    isObject(
      data.data
    )
  ) {
    return data.data;
  }

  if (
    isObject(
      data.result
    )
  ) {
    return data.result;
  }

  return data;
};

/* =========================================================
   DATA RESOLVERS
========================================================= */

const resolveGoals = (
  data
) =>
  toArray(
    data.goals ??
      data.savingsGoals
  );

const resolveChallenges = (
  data
) =>
  toArray(
    data.challenges ??
      data.savingsChallenges
  );

const resolveActivity = (
  data
) =>
  toArray(
    data.activity ??
      data.activities ??
      data.savingsActivity
  );

const resolveInsights = (
  data
) =>
  toArray(
    data.insights ??
      data.savingsInsights
  );

const resolveStrategies = (
  data
) =>
  toArray(
    data.strategies ??
      data.savingStrategies
  );

const resolveForecast = (
  data
) =>
  data.forecast ??
  data.savingsForecast ??
  null;

const resolveHealth = (
  data
) =>
  data.health ??
  data.savingsHealth ??
  data.healthScore ??
  null;

const resolveSafeToSave = (
  data
) =>
  data.safeToSave ??
  data.safeToSaveResult ??
  null;

const resolveEmergencyFund = (
  data
) =>
  data.emergencyFund ??
  data.emergencyFundStatus ??
  null;

/* =========================================================
   MAIN PAGE
========================================================= */

const SmartSave = () => {
  /* =======================================================
     SMARTSAVE ORCHESTRATION
  ======================================================= */

  const smartSave =
    useSmartSave();

  const {
    data,
    loading,
    error,
    refresh,
    isRefreshing,

    /*
     * These are intentionally read
     * defensively because the hook may
     * expose them as the SmartSave
     * module evolves.
     */
    createGoal,
    createChallenge,

    showCreateGoalModal,
    setShowCreateGoalModal,

    showCreateChallengeModal,
    setShowCreateChallengeModal,
  } =
    smartSave ?? {};

  /* =======================================================
     NORMALIZED PAGE DATA
  ======================================================= */

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

  /* =======================================================
     ACTIONS
  ======================================================= */

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
        /*
         * Refresh errors remain owned
         * by useSmartSave.
         */
      }
    };

  const handleCreateGoal =
    () => {
      if (
        typeof setShowCreateGoalModal ===
        "function"
      ) {
        setShowCreateGoalModal(
          true
        );
        return;
      }

      /*
       * If the hook does not expose
       * modal state, the page remains
       * safely renderable.
       */
    };

  const handleCreateChallenge =
    () => {
      if (
        typeof setShowCreateChallengeModal ===
        "function"
      ) {
        setShowCreateChallengeModal(
          true
        );
      }
    };

  const handleGoalCreated =
    async (
      payload
    ) => {
      if (
        typeof createGoal ===
        "function"
      ) {
        await createGoal(
          payload
        );
      }

      if (
        typeof setShowCreateGoalModal ===
        "function"
      ) {
        setShowCreateGoalModal(
          false
        );
      }

      if (
        typeof refresh ===
        "function"
      ) {
        await refresh();
      }
    };

  const handleChallengeCreated =
    async (
      payload
    ) => {
      if (
        typeof createChallenge ===
        "function"
      ) {
        await createChallenge(
          payload
        );
      }

      if (
        typeof setShowCreateChallengeModal ===
        "function"
      ) {
        setShowCreateChallengeModal(
          false
        );
      }

      if (
        typeof refresh ===
        "function"
      ) {
        await refresh();
      }
    };

  const handleCloseGoalModal =
    () => {
      if (
        typeof setShowCreateGoalModal ===
        "function"
      ) {
        setShowCreateGoalModal(
          false
        );
      }
    };

  const handleCloseChallengeModal =
    () => {
      if (
        typeof setShowCreateChallengeModal ===
        "function"
      ) {
        setShowCreateChallengeModal(
          false
        );
      }
    };

  /* =======================================================
     LOADING
========================================================= */

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

  /* =======================================================
     ERROR
========================================================= */

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
              error={
                error
              }
              onRetry={
                handleRefresh
              }
            />
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     EMPTY SMARTSAVE
========================================================= */

  const hasSavingsContent =
    goals.length > 0 ||
    challenges.length > 0 ||
    activity.length > 0 ||
    insights.length > 0 ||
    strategies.length > 0 ||
    Boolean(
      forecast
    ) ||
    Boolean(
      health
    ) ||
    Boolean(
      safeToSave
    ) ||
    Boolean(
      emergencyFund
    );

  /* =======================================================
     PAGE
========================================================= */

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
          mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7
        "
      >
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <SmartSaveHeader
          currency={
            DEFAULT_CURRENCY ??
            "NGN"
          }
          onCreateGoal={
            handleCreateGoal
          }
          showStats
          showRefresh
        />

        {/* =================================================
            STALE DATA / REFRESH INDICATOR
        ================================================= */}

        {isRefreshing && (
          <div
            className="
              flex items-center
              mt-3 px-4 py-2.5
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

            Updating your
            SmartSave data...
          </div>
        )}

        {/* =================================================
            PARTIAL ERROR
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

                <div>
                  <p
                    className="
                      font-semibold text-amber-900 text-sm
                    "
                  >
                    Some savings data
                    could not be updated.
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-amber-700 text-xs leading-5
                    "
                  >
                    Your previously
                    loaded data is still
                    available.
                  </p>
                </div>
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
            MAIN OVERVIEW
        ================================================= */}

        <section
          className="
            mt-6
          "
        >
          <SavingsOverview
            currency={
              DEFAULT_CURRENCY ??
              "NGN"
            }
            onCreateGoal={
              handleCreateGoal
            }
            onCreateChallenge={
              handleCreateChallenge
            }
            showHealth
            showSafeToSave
            showGoals
            showChallenges
            showActivity
            showInsights
            showStrategies
            showProgress
            showRefresh={false}
          />
        </section>

        <section>
      <EmergencyFundProgress
        data={emergencyFund}
      />

      <EmergencyFundCoverage
        data={emergencyFund}
      />

      <EmergencyFundRecommendation
        data={emergencyFund}
      />

      <EmergencyFundInsights
        data={emergencyFund}
      />
    </section>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!hasSavingsContent && (
          <section
            className="
              mt-6
            "
          >
            <SavingsEmptyState
              title="Your SmartSave workspace is ready"
              description="Create a savings goal to start building your personalized SmartSave plan."
              actionLabel="Create savings goal"
              onAction={
                handleCreateGoal
              }
            />
          </section>
        )}

        {/* =================================================
            FINANCIAL INTELLIGENCE
        ================================================= */}

        {(health ||
          safeToSave ||
          forecast ||
          emergencyFund) && (
          <section
            className="
              space-y-4 mt-8
            "
            aria-labelledby="smart-save-intelligence"
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
                  bg-slate-900
                  rounded-lg
                "
              >
                <Sparkles
                  size={15}
                  className="
                    text-white
                  "
                  aria-hidden="true"
                /
                >
              </div>

              <div>
                <h2
                  id="smart-save-intelligence"
                  className="
                    font-bold text-slate-900 text-base
                  "
                >
                  SmartSave intelligence
                </h2>

                <p
                  className="
                    mt-0.5
                    text-slate-500 text-xs
                  "
                >
                  Personalized signals
                  to help you make better
                  saving decisions.
                </p>
              </div>
            </div>

            <div
              className="
                grid grid-cols-1 xl:grid-cols-2
                gap-5
              "
            >
              {health && (
                <SavingsHealthScore
                  data={
                    health
                  }
                  currency={
                    DEFAULT_CURRENCY ??
                    "NGN"
                  }
                />
              )}

              {safeToSave && (
                <SafeToSaveCard
                  result={
                    safeToSave
                  }
                  currency={
                    DEFAULT_CURRENCY ??
                    "NGN"
                  }
                />
              )}

              {forecast && (
                <SavingsForecastCard
                  forecast={
                    forecast
                  }
                  currency={
                    DEFAULT_CURRENCY ??
                    "NGN"
                  }
                />
              )}

              {emergencyFund && (
                <section
                  className="
                    p-5
                    bg-white
                    border border-slate-200 rounded-2xl
                    shadow-sm
                  "
                >
                  <div
                    className="
                      flex items-center
                      gap-3
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
                      <Sparkles
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
                        Emergency fund
                      </h3>

                      <p
                        className="
                          mt-0.5
                          text-slate-500 text-xs
                        "
                      >
                        Your emergency
                        savings position.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-5 p-4
                      bg-slate-50
                      rounded-xl
                    "
                  >
                    <pre
                      className="
                        overflow-x-auto
                        font-sans text-slate-600 text-xs break-words leading-5
                        whitespace-pre-wrap
                      "
                    >
                      {typeof emergencyFund ===
                      "string"
                        ? emergencyFund
                        : "Emergency fund information available."}
                    </pre>
                  </div>
                </section>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            GOALS
        ================================================= */}

        <section
          className="
            mt-8
          "
        >
          <SavingsGoalSection
            goals={
              goals
            }
            onCreate={
              handleCreateGoal
            }
          />
        </section>

        {/* =================================================
            CHALLENGES
        ================================================= */}

        <section
          className="
            mt-8
          "
        >
          <SavingsChallengeSection
            challenges={
              challenges
            }
            onCreate={
              handleCreateChallenge
            }
          />
        </section>

        {/* =================================================
            FORECAST
        ================================================= */}

        {forecast && (
          <section
            className="
              mt-8
            "
          >
            <SavingsForecastCard
              forecast={
                forecast
              }
              currency={
                DEFAULT_CURRENCY ??
                "NGN"
              }
            />
          </section>
        )}

        {/* =================================================
            SAVINGS STRATEGIES
        ================================================= */}

        <section
          className="
            mt-8
          "
        >
          <SavingsStrategiesSection
            strategies={
              strategies
            }
          />
        </section>

        {/* =================================================
            INSIGHTS
        ================================================= */}

        <section
          className="
            mt-8
          "
        >
          <SavingsInsightsSection
            insights={
              insights
            }
          />
        </section>

        {/* =================================================
            ACTIVITY
        ================================================= */}

        <section
          className="
            mt-8
          "
        >
          <SavingsActivitySection
            activity={
              activity
            }
          />
        </section>

        {/* =================================================
            FOOTER STATUS
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
              SmartSave keeps your
              savings goals,
              progress and insights
              connected.
            </p>

            <p
              className="
                font-medium
              "
            >
              Currency:{" "}
              {DEFAULT_CURRENCY ??
                "NGN"}
            </p>
          </div>
        </footer>
      </div>

      {/* ===================================================
          CREATE SAVINGS GOAL MODAL
      =================================================== */}

      {showCreateGoalModal && (
        <CreateSavingsGoalModal
          open={
            showCreateGoalModal
          }
          onClose={
            handleCloseGoalModal
          }
          onSubmit={
            handleGoalCreated
          }
        />
      )}

      {/* ===================================================
          CREATE CHALLENGE MODAL
      =================================================== */}

      {showCreateChallengeModal && (
        <CreateChallengeModal
          open={
            showCreateChallengeModal
          }
          onClose={
            handleCloseChallengeModal
          }
          onSubmit={
            handleChallengeCreated
          }
        />
      )}
    </main>
  );
};

export default SmartSave;