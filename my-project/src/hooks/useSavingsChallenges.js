// hooks/useSavingsChallenges.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import smartSaveService from "../services/smartSaveService";

/**
 * ============================================================
 * useSavingsChallenges
 * ============================================================
 *
 * Production-ready React hook for the SmartBudget
 * Savings Challenge module.
 *
 * Responsibilities:
 *
 * - Fetch user savings challenges
 * - Fetch filtered challenge collections
 * - Fetch individual challenges
 * - Fetch challenge snapshots
 * - Fetch challenge summaries
 * - Fetch active / paused / completed challenges
 * - Create challenges
 * - Update challenges
 * - Manage challenge lifecycle
 * - Apply confirmed contributions
 * - Register successful / missed periods
 * - Archive / restore challenges
 * - Maintain loading / error / mutation state
 * - Prevent stale requests from overwriting newer state
 * - Prevent state updates after unmount
 * - Keep query-driven fetching stable
 *
 * IMPORTANT:
 *
 * API endpoints and business logic belong to:
 *
 *   smartSaveService.js
 *
 * This hook must not duplicate backend URLs or
 * backend business rules.
 * ============================================================
 */

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const DEFAULT_QUERY = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
};

const INITIAL_COLLECTION = {
  items: [],
  pagination: null,
  meta: null,
};

const INITIAL_SUMMARY = null;
const INITIAL_ERROR = null;

/* ============================================================
   ERROR NORMALIZATION
============================================================ */

/**
 * Keeps the hook's public error contract predictable.
 *
 * smartSaveService remains responsible for converting
 * Axios / backend failures into normalized service errors.
 */
const normalizeHookError = (error) => {
  if (!error) {
    return null;
  }

  return {
    message:
      error.message ||
      "Unable to complete the savings challenge request.",

    code:
      error.code ||
      "SAVINGS_CHALLENGE_ERROR",

    status:
      error.status ??
      error.statusCode ??
      null,

    details:
      error.details ??
      null,

    originalError: error,
  };
};

/* ============================================================
   QUERY NORMALIZATION
============================================================ */

/**
 * Performs only frontend-level normalization.
 *
 * smartSaveService remains responsible for the final
 * request/query construction.
 */
const normalizeQuery = (query = {}) => ({
  page:
    Number.isInteger(Number(query.page)) &&
    Number(query.page) > 0
      ? Number(query.page)
      : DEFAULT_PAGE,

  limit:
    Number.isInteger(Number(query.limit)) &&
    Number(query.limit) > 0
      ? Number(query.limit)
      : DEFAULT_LIMIT,

  ...(query.status
    ? {
        status: query.status,
      }
    : {}),

  ...(query.challengeType
    ? {
        challengeType: query.challengeType,
      }
    : {}),

  ...(query.difficulty
    ? {
        difficulty: query.difficulty,
      }
    : {}),

  ...(query.savingPlan
    ? {
        savingPlan: query.savingPlan,
      }
    : {}),

  ...(query.savingAccount
    ? {
        savingAccount: query.savingAccount,
      }
    : {}),

  ...(typeof query.includeTemplates === "boolean"
    ? {
        includeTemplates:
          query.includeTemplates,
      }
    : {}),
});

/* ============================================================
   QUERY COMPARISON
============================================================ */

/**
 * Performs a shallow comparison of normalized query objects.
 *
 * Because normalizeQuery() produces primitive query values,
 * Object.is() is sufficient here.
 */
const areQueriesEqual = (
  first,
  second
) => {
  const firstKeys =
    Object.keys(first);

  const secondKeys =
    Object.keys(second);

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  return firstKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(
        second,
        key
      ) &&
      Object.is(
        first[key],
        second[key]
      )
  );
};

/* ============================================================
   COLLECTION NORMALIZATION
============================================================ */

const normalizeCollectionResponse = (
  response
) => {
  if (!response) {
    return INITIAL_COLLECTION;
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: null,
      meta: null,
    };
  }

  const items =
    response.items ??
    response.challenges ??
    response.data ??
    [];

  return {
    items: Array.isArray(items)
      ? items
      : [],

    pagination:
      response.pagination ??
      response.meta?.pagination ??
      null,

    meta:
      response.meta ??
      null,
  };
};

/* ============================================================
   HOOK
============================================================ */

const useSavingsChallenges = ({
  autoFetch = true,
  initialQuery = DEFAULT_QUERY,
  challengeId = null,
} = {}) => {
  /* ==========================================================
     STATE
  ========================================================== */

  const [collection, setCollection] =
    useState(INITIAL_COLLECTION);

  const [challenge, setChallenge] =
    useState(null);

  const [snapshot, setSnapshot] =
    useState(null);

  const [summary, setSummary] =
    useState(INITIAL_SUMMARY);

  const [activeChallenges, setActiveChallenges] =
    useState([]);

  const [pausedChallenges, setPausedChallenges] =
    useState([]);

  const [completedChallenges, setCompletedChallenges] =
    useState([]);

  const [query, setQuery] =
    useState(() =>
      normalizeQuery(initialQuery)
    );

  const [loading, setLoading] =
    useState(false);

  const [loadingChallenge, setLoadingChallenge] =
    useState(false);

  const [loadingSnapshot, setLoadingSnapshot] =
    useState(false);

  const [loadingSummary, setLoadingSummary] =
    useState(false);

  const [loadingActive, setLoadingActive] =
    useState(false);

  const [loadingPaused, setLoadingPaused] =
    useState(false);

  const [loadingCompleted, setLoadingCompleted] =
    useState(false);

  const [mutating, setMutating] =
    useState(false);

  const [error, setError] =
    useState(INITIAL_ERROR);

  const [mutationError, setMutationError] =
    useState(INITIAL_ERROR);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  /* ==========================================================
     MOUNT TRACKING
  ========================================================== */

  const mountedRef =
    useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ==========================================================
     QUERY REF
  ========================================================== */

  /**
   * query remains React state because it drives rendering.
   *
   * queryRef provides the latest query to stable callbacks
   * without forcing those callbacks to depend directly on
   * query.
   *
   * IMPORTANT:
   *
   * The ref is synchronized inside an effect rather than
   * being read/written as part of render logic.
   */
  const queryRef =
    useRef(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  /* ==========================================================
     CHALLENGE ID REF
  ========================================================== */

  const challengeIdRef =
    useRef(challengeId);

  useEffect(() => {
    challengeIdRef.current =
      challengeId;
  }, [challengeId]);

  /* ==========================================================
     REQUEST TRACKING
  ========================================================== */

  /**
   * Each resource has its own request sequence.
   *
   * This is important because refresh() can intentionally
   * execute several requests concurrently.
   *
   * A single global request ID would incorrectly invalidate
   * otherwise valid responses.
   */

  const challengesRequestIdRef =
    useRef(0);

  const challengeRequestIdRef =
    useRef(0);

  const snapshotRequestIdRef =
    useRef(0);

  const summaryRequestIdRef =
    useRef(0);

  const activeRequestIdRef =
    useRef(0);

  const pausedRequestIdRef =
    useRef(0);

  const completedRequestIdRef =
    useRef(0);

  /* ==========================================================
     REQUEST ID HELPERS
  ========================================================== */

  const nextChallengesRequestId =
    useCallback(() => {
      challengesRequestIdRef.current += 1;

      return challengesRequestIdRef.current;
    }, []);

  const nextChallengeRequestId =
    useCallback(() => {
      challengeRequestIdRef.current += 1;

      return challengeRequestIdRef.current;
    }, []);

  const nextSnapshotRequestId =
    useCallback(() => {
      snapshotRequestIdRef.current += 1;

      return snapshotRequestIdRef.current;
    }, []);

  const nextSummaryRequestId =
    useCallback(() => {
      summaryRequestIdRef.current += 1;

      return summaryRequestIdRef.current;
    }, []);

  const nextActiveRequestId =
    useCallback(() => {
      activeRequestIdRef.current += 1;

      return activeRequestIdRef.current;
    }, []);

  const nextPausedRequestId =
    useCallback(() => {
      pausedRequestIdRef.current += 1;

      return pausedRequestIdRef.current;
    }, []);

  const nextCompletedRequestId =
    useCallback(() => {
      completedRequestIdRef.current += 1;

      return completedRequestIdRef.current;
    }, []);

  /* ==========================================================
     REQUEST VALIDATION HELPERS
  ========================================================== */

  const isCurrentChallengesRequest =
    useCallback(
      (requestId) =>
        mountedRef.current &&
        requestId ===
          challengesRequestIdRef.current,
      []
    );

  const isCurrentChallengeRequest =
    useCallback(
      (requestId) =>
        mountedRef.current &&
        requestId ===
          challengeRequestIdRef.current,
      []
    );

  const isCurrentSnapshotRequest =
    useCallback(
      (requestId) =>
        mountedRef.current &&
        requestId ===
          snapshotRequestIdRef.current,
      []
    );

  const isCurrentSummaryRequest =
    useCallback(
      (requestId) =>
        mountedRef.current &&
        requestId ===
          summaryRequestIdRef.current,
      []
    );

  const isCurrentActiveRequest =
    useCallback(
      (requestId) =>
        mountedRef.current &&
        requestId ===
          activeRequestIdRef.current,
      []
    );

  const isCurrentPausedRequest =
    useCallback(
      (requestId) =>
        mountedRef.current &&
        requestId ===
          pausedRequestIdRef.current,
      []
    );

  const isCurrentCompletedRequest =
    useCallback(
      (requestId) =>
        mountedRef.current &&
        requestId ===
          completedRequestIdRef.current,
      []
    );

  /* ==========================================================
     FETCH USER CHALLENGES
  ========================================================== */

  const fetchChallenges =
    useCallback(
      async (nextQuery) => {
        const normalizedQuery =
          normalizeQuery(
            nextQuery ??
              queryRef.current
          );

        const requestId =
          nextChallengesRequestId();

        if (!mountedRef.current) {
          return null;
        }

        setLoading(true);
        setError(null);

        try {
          const response =
            await smartSaveService.getSavingsChallenges(
              normalizedQuery
            );

          if (
            !isCurrentChallengesRequest(
              requestId
            )
          ) {
            return response;
          }

          const normalized =
            normalizeCollectionResponse(
              response
            );

          setCollection(
            normalized
          );

          setLastUpdated(
            new Date()
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeHookError(
              requestError
            );

          if (
            isCurrentChallengesRequest(
              requestId
            )
          ) {
            setError(
              normalizedError
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentChallengesRequest(
              requestId
            )
          ) {
            setLoading(false);
          }
        }
      },
      [
        nextChallengesRequestId,
        isCurrentChallengesRequest,
      ]
    );

  /* ==========================================================
     FETCH SINGLE CHALLENGE
  ========================================================== */

  const fetchChallenge =
    useCallback(
      async (
        id = challengeIdRef.current
      ) => {
        if (!id) {
          return null;
        }

        const requestId =
          nextChallengeRequestId();

        if (!mountedRef.current) {
          return null;
        }

        setLoadingChallenge(true);
        setError(null);

        try {
          const response =
            await smartSaveService.getSavingsChallenge(
              id
            );

          if (
            !isCurrentChallengeRequest(
              requestId
            )
          ) {
            return response;
          }

          setChallenge(response);
          setLastUpdated(
            new Date()
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeHookError(
              requestError
            );

          if (
            isCurrentChallengeRequest(
              requestId
            )
          ) {
            setError(
              normalizedError
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentChallengeRequest(
              requestId
            )
          ) {
            setLoadingChallenge(
              false
            );
          }
        }
      },
      [
        nextChallengeRequestId,
        isCurrentChallengeRequest,
      ]
    );

  /* ==========================================================
     FETCH SNAPSHOT
  ========================================================== */

  const fetchSnapshot =
    useCallback(
      async (
        id = challengeIdRef.current
      ) => {
        if (!id) {
          return null;
        }

        const requestId =
          nextSnapshotRequestId();

        if (!mountedRef.current) {
          return null;
        }

        setLoadingSnapshot(true);
        setError(null);

        try {
          const response =
            await smartSaveService.getChallengeSnapshot(
              id
            );

          if (
            !isCurrentSnapshotRequest(
              requestId
            )
          ) {
            return response;
          }

          setSnapshot(response);
          setLastUpdated(
            new Date()
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeHookError(
              requestError
            );

          if (
            isCurrentSnapshotRequest(
              requestId
            )
          ) {
            setError(
              normalizedError
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentSnapshotRequest(
              requestId
            )
          ) {
            setLoadingSnapshot(
              false
            );
          }
        }
      },
      [
        nextSnapshotRequestId,
        isCurrentSnapshotRequest,
      ]
    );

  /* ==========================================================
     FETCH SUMMARY
  ========================================================== */

  const fetchSummary =
    useCallback(
      async () => {
        const requestId =
          nextSummaryRequestId();

        if (!mountedRef.current) {
          return null;
        }

        setLoadingSummary(true);
        setError(null);

        try {
          const response =
            await smartSaveService.getSavingsChallengeSummary();

          if (
            !isCurrentSummaryRequest(
              requestId
            )
          ) {
            return response;
          }

          setSummary(response);
          setLastUpdated(
            new Date()
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeHookError(
              requestError
            );

          if (
            isCurrentSummaryRequest(
              requestId
            )
          ) {
            setError(
              normalizedError
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentSummaryRequest(
              requestId
            )
          ) {
            setLoadingSummary(
              false
            );
          }
        }
      },
      [
        nextSummaryRequestId,
        isCurrentSummaryRequest,
      ]
    );

  /* ==========================================================
     FETCH ACTIVE CHALLENGES
  ========================================================== */

  const fetchActiveChallenges =
    useCallback(
      async () => {
        const requestId =
          nextActiveRequestId();

        if (!mountedRef.current) {
          return null;
        }

        setLoadingActive(true);
        setError(null);

        try {
          const response =
            await smartSaveService.getActiveSavingsChallenges();

          if (
            !isCurrentActiveRequest(
              requestId
            )
          ) {
            return response;
          }

          const normalized =
            normalizeCollectionResponse(
              response
            );

          setActiveChallenges(
            normalized.items
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeHookError(
              requestError
            );

          if (
            isCurrentActiveRequest(
              requestId
            )
          ) {
            setError(
              normalizedError
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentActiveRequest(
              requestId
            )
          ) {
            setLoadingActive(false);
          }
        }
      },
      [
        nextActiveRequestId,
        isCurrentActiveRequest,
      ]
    );

  /* ==========================================================
     FETCH PAUSED CHALLENGES
  ========================================================== */

  const fetchPausedChallenges =
    useCallback(
      async () => {
        const requestId =
          nextPausedRequestId();

        if (!mountedRef.current) {
          return null;
        }

        setLoadingPaused(true);
        setError(null);

        try {
          const response =
            await smartSaveService.getPausedSavingsChallenges();

          if (
            !isCurrentPausedRequest(
              requestId
            )
          ) {
            return response;
          }

          const normalized =
            normalizeCollectionResponse(
              response
            );

          setPausedChallenges(
            normalized.items
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeHookError(
              requestError
            );

          if (
            isCurrentPausedRequest(
              requestId
            )
          ) {
            setError(
              normalizedError
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentPausedRequest(
              requestId
            )
          ) {
            setLoadingPaused(false);
          }
        }
      },
      [
        nextPausedRequestId,
        isCurrentPausedRequest,
      ]
    );

  /* ==========================================================
     FETCH COMPLETED CHALLENGES
  ========================================================== */

  const fetchCompletedChallenges =
    useCallback(
      async () => {
        const requestId =
          nextCompletedRequestId();

        if (!mountedRef.current) {
          return null;
        }

        setLoadingCompleted(true);
        setError(null);

        try {
          const response =
            await smartSaveService.getCompletedSavingsChallenges();

          if (
            !isCurrentCompletedRequest(
              requestId
            )
          ) {
            return response;
          }

          const normalized =
            normalizeCollectionResponse(
              response
            );

          setCompletedChallenges(
            normalized.items
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeHookError(
              requestError
            );

          if (
            isCurrentCompletedRequest(
              requestId
            )
          ) {
            setError(
              normalizedError
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentCompletedRequest(
              requestId
            )
          ) {
            setLoadingCompleted(
              false
            );
          }
        }
      },
      [
        nextCompletedRequestId,
        isCurrentCompletedRequest,
      ]
    );

  /* ==========================================================
     MUTATION WRAPPER
  ========================================================== */

  const executeMutation =
    useCallback(
      async (
        mutation,
        {
          refresh = true,
          refreshSnapshot = false,
          refreshSummary = true,
          refreshLists = false,
        } = {}
      ) => {
        if (!mountedRef.current) {
          return null;
        }

        setMutating(true);
        setMutationError(null);
        setError(null);

        try {
          const response =
            await mutation();

          if (!mountedRef.current) {
            return response;
          }

          /*
           * Refresh collection using the latest query.
           */
          if (refresh) {
            await fetchChallenges(
              queryRef.current
            );
          }

          /*
           * Refresh the currently selected challenge.
           */
          if (
            refreshSnapshot &&
            challengeIdRef.current
          ) {
            await fetchSnapshot(
              challengeIdRef.current
            );
          }

          /*
           * Refresh summary.
           */
          if (refreshSummary) {
            await fetchSummary();
          }

          /*
           * Refresh status-specific collections.
           *
           * These are intentionally concurrent.
           */
          if (refreshLists) {
            await Promise.allSettled([
              fetchActiveChallenges(),
              fetchPausedChallenges(),
              fetchCompletedChallenges(),
            ]);
          }

          if (mountedRef.current) {
            setLastUpdated(
              new Date()
            );
          }

          return response;
        } catch (
          mutationRequestError
        ) {
          const normalizedError =
            normalizeHookError(
              mutationRequestError
            );

          if (mountedRef.current) {
            setMutationError(
              normalizedError
            );
          }

          throw mutationRequestError;
        } finally {
          if (mountedRef.current) {
            setMutating(false);
          }
        }
      },
      [
        fetchChallenges,
        fetchSnapshot,
        fetchSummary,
        fetchActiveChallenges,
        fetchPausedChallenges,
        fetchCompletedChallenges,
      ]
    );

  /* ==========================================================
     CREATE
  ========================================================== */

  const createChallenge = useCallback(
  async (
    payload,
    options = {}
  ) =>
    executeMutation(
      () =>
        smartSaveService.createSavingsChallenge(
          payload
        ),
      options
    ),
  [executeMutation]
);

  /* ==========================================================
     UPDATE
  ========================================================== */

  const updateChallenge =
    useCallback(
      async (id, payload) =>
        executeMutation(
          () =>
            smartSaveService.updateSavingsChallenge(
              id,
              payload
            ),
          {
            refreshSnapshot: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     ACTIVATE
  ========================================================== */

  const activateChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.activateSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     PAUSE
  ========================================================== */

  const pauseChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.pauseSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     RESUME
  ========================================================== */

  const resumeChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.resumeSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     COMPLETE
  ========================================================== */

  const completeChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.completeSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     CANCEL
  ========================================================== */

  const cancelChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.cancelSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     FAIL
  ========================================================== */

  const failChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.failSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     EXPIRE
  ========================================================== */

  const expireChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.expireSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     APPLY CONTRIBUTION
  ========================================================== */

  const applyContribution =
    useCallback(
      async (id, payload) =>
        executeMutation(
          () =>
            smartSaveService.applyContributionToChallenge(
              id,
              payload
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     SUCCESSFUL PERIOD
  ========================================================== */

  const registerSuccessfulPeriod =
    useCallback(
      async (id, payload) =>
        executeMutation(
          () =>
            smartSaveService.registerSuccessfulChallengePeriod(
              id,
              payload
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     MISSED PERIOD
  ========================================================== */

  const registerMissedPeriod =
    useCallback(
      async (id, payload) =>
        executeMutation(
          () =>
            smartSaveService.registerMissedChallengePeriod(
              id,
              payload
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     ARCHIVE
  ========================================================== */

  const archiveChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.archiveSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: false,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     RESTORE
  ========================================================== */

  const restoreChallenge =
    useCallback(
      async (id) =>
        executeMutation(
          () =>
            smartSaveService.restoreSavingsChallenge(
              id
            ),
          {
            refreshSnapshot: true,
            refreshLists: true,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     QUERY MANAGEMENT
  ========================================================== */

  const updateQuery =
    useCallback(
      (updates = {}) => {
        setQuery((previous) => {
          const next =
            normalizeQuery({
              ...previous,
              ...updates,
            });

          if (
            areQueriesEqual(
              previous,
              next
            )
          ) {
            return previous;
          }

          return next;
        });
      },
      []
    );

  const resetQuery =
    useCallback(() => {
      setQuery((previous) => {
        const next =
          normalizeQuery(
            DEFAULT_QUERY
          );

        if (
          areQueriesEqual(
            previous,
            next
          )
        ) {
          return previous;
        }

        return next;
      });
    }, []);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(
      async () => {
        const operations = [
          fetchChallenges(
            queryRef.current
          ),

          fetchSummary(),
        ];

        if (
          challengeIdRef.current
        ) {
          operations.push(
            fetchChallenge(
              challengeIdRef.current
            ),

            fetchSnapshot(
              challengeIdRef.current
            )
          );
        }

        await Promise.allSettled(
          operations
        );

        return true;
      },
      [
        fetchChallenges,
        fetchSummary,
        fetchChallenge,
        fetchSnapshot,
      ]
    );

  /* ==========================================================
     CLEAR ERRORS
  ========================================================== */

  const clearError =
    useCallback(() => {
      if (!mountedRef.current) {
        return;
      }

      setError(null);
      setMutationError(null);
    }, []);

  /* ==========================================================
     INITIAL / QUERY FETCH
  ========================================================== */

  /**
   * fetchChallenges is intentionally stable.
   *
   * Query is included here because query changes should
   * automatically fetch the corresponding collection.
   *
   * This does NOT create a render loop because:
   *
   * fetchChallenges does not depend on query.
   */
  useEffect(() => {
  if (!autoFetch || !mountedRef.current) {
    return;
  }

  void fetchChallenges(query);
}, [autoFetch, query, fetchChallenges]);

  /* ==========================================================
     DERIVED STATE
  ========================================================== */

  const items =
    collection.items;

  const pagination =
    collection.pagination;

  const total =
    pagination?.total ??
    collection.meta?.total ??
    items.length;

  const hasItems =
    items.length > 0;

  const loadingLists =
    loadingActive ||
    loadingPaused ||
    loadingCompleted;

  const isEmpty =
    !loading &&
    !hasItems;

  const hasNextPage =
    Boolean(
      pagination?.hasNextPage ??
        (
          pagination?.page &&
          pagination?.pages &&
          pagination.page <
            pagination.pages
        )
    );

  const hasPreviousPage =
    Boolean(
      pagination?.hasPreviousPage ??
        (
          pagination?.page &&
          pagination.page > 1
        )
    );

  /* ==========================================================
     STABLE STATE OBJECT
  ========================================================== */

  const state =
    useMemo(
      () => ({
        items,

        challenge,

        snapshot,

        summary,

        activeChallenges,

        pausedChallenges,

        completedChallenges,

        query,

        pagination,

        total,

        hasItems,

        isEmpty,

        hasNextPage,

        hasPreviousPage,

        loading,

        loadingChallenge,

        loadingSnapshot,

        loadingSummary,

        loadingLists,

        loadingActive,

        loadingPaused,

        loadingCompleted,

        mutating,

        error,

        mutationError,

        lastUpdated,
      }),
      [
        items,
        challenge,
        snapshot,
        summary,
        activeChallenges,
        pausedChallenges,
        completedChallenges,
        query,
        pagination,
        total,
        hasItems,
        isEmpty,
        hasNextPage,
        hasPreviousPage,
        loading,
        loadingChallenge,
        loadingSnapshot,
        loadingSummary,
        loadingLists,
        loadingActive,
        loadingPaused,
        loadingCompleted,
        mutating,
        error,
        mutationError,
        lastUpdated,
      ]
    );

  /* ==========================================================
     RETURN API
  ========================================================== */

  return {
    ...state,

    /* --------------------------------------------------------
       Fetch
    -------------------------------------------------------- */

    fetchChallenges,
    fetchChallenge,
    fetchSnapshot,
    fetchSummary,

    fetchActiveChallenges,
    fetchPausedChallenges,
    fetchCompletedChallenges,

    /* --------------------------------------------------------
       CRUD
    -------------------------------------------------------- */

    createChallenge,
    updateChallenge,

    /* --------------------------------------------------------
       Lifecycle
    -------------------------------------------------------- */

    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,
    failChallenge,
    expireChallenge,

    /* --------------------------------------------------------
       Progress
    -------------------------------------------------------- */

    applyContribution,
    registerSuccessfulPeriod,
    registerMissedPeriod,

    /* --------------------------------------------------------
       Archive
    -------------------------------------------------------- */

    archiveChallenge,
    restoreChallenge,

    /* --------------------------------------------------------
       Query
    -------------------------------------------------------- */

    updateQuery,
    resetQuery,

    /* --------------------------------------------------------
       General
    -------------------------------------------------------- */

    refresh,
    clearError,
  };
};

export default useSavingsChallenges;