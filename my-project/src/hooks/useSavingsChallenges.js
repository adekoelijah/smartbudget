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
 * - Register successful/missed periods
 * - Archive / restore challenges
 * - Maintain loading/error/mutation state
 * - Prevent stale requests from overwriting newer state
 *
 * IMPORTANT:
 *
 * API endpoints and request/response normalization belong to:
 *
 *   smartSaveService.js
 *
 * This hook must NOT duplicate backend URLs or business logic.
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
 * Keeps the hook's error contract predictable.
 *
 * smartSaveService is still responsible for converting Axios /
 * backend errors into its normalized service error.
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
 * Only performs frontend-level normalization.
 *
 * smartSaveService remains responsible for the final API
 * query construction.
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
    ? { status: query.status }
    : {}),

  ...(query.challengeType
    ? {
        challengeType:
          query.challengeType,
      }
    : {}),

  ...(query.difficulty
    ? {
        difficulty:
          query.difficulty,
      }
    : {}),

  ...(query.savingPlan
    ? {
        savingPlan:
          query.savingPlan,
      }
    : {}),

  ...(query.savingAccount
    ? {
        savingAccount:
          query.savingAccount,
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

  const [loadingLists, setLoadingLists] =
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
     REQUEST TRACKING
  ========================================================== */

  const requestIdRef =
    useRef(0);

  const mountedRef =
    useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const nextRequestId = useCallback(
    () => {
      requestIdRef.current += 1;

      return requestIdRef.current;
    },
    []
  );

  /* ==========================================================
     SAFE STATE UPDATE
  ========================================================== */

  const isCurrentRequest = useCallback(
    (requestId) =>
      mountedRef.current &&
      requestId === requestIdRef.current,
    []
  );

  /* ==========================================================
     FETCH USER CHALLENGES
  ========================================================== */

  const fetchChallenges = useCallback(
    async (nextQuery = query) => {
      const normalizedQuery =
        normalizeQuery(nextQuery);

      const requestId =
        nextRequestId();

      setLoading(true);
      setError(null);

      try {
        const response =
          await smartSaveService.getSavingsChallenges(
            normalizedQuery
          );

        if (
          !isCurrentRequest(requestId)
        ) {
          return response;
        }

        const normalized =
          normalizeCollectionResponse(
            response
          );

        setCollection(normalized);
        setQuery(normalizedQuery);
        setLastUpdated(new Date());

        return response;
      } catch (requestError) {
        const normalizedError =
          normalizeHookError(
            requestError
          );

        if (
          isCurrentRequest(requestId)
        ) {
          setError(normalizedError);
        }

        throw requestError;
      } finally {
        if (
          isCurrentRequest(requestId)
        ) {
          setLoading(false);
        }
      }
    },
    [
      query,
      nextRequestId,
      isCurrentRequest,
    ]
  );

  /* ==========================================================
     FETCH SINGLE CHALLENGE
  ========================================================== */

  const fetchChallenge = useCallback(
    async (id = challengeId) => {
      const requestId =
        nextRequestId();

      setLoadingChallenge(true);
      setError(null);

      try {
        const response =
          await smartSaveService.getSavingsChallenge(
            id
          );

        if (
          !isCurrentRequest(requestId)
        ) {
          return response;
        }

        setChallenge(response);
        setLastUpdated(new Date());

        return response;
      } catch (requestError) {
        const normalizedError =
          normalizeHookError(
            requestError
          );

        if (
          isCurrentRequest(requestId)
        ) {
          setError(normalizedError);
        }

        throw requestError;
      } finally {
        if (
          isCurrentRequest(requestId)
        ) {
          setLoadingChallenge(false);
        }
      }
    },
    [
      challengeId,
      nextRequestId,
      isCurrentRequest,
    ]
  );

  /* ==========================================================
     FETCH SNAPSHOT
  ========================================================== */

  const fetchSnapshot = useCallback(
    async (id = challengeId) => {
      const requestId =
        nextRequestId();

      setLoadingSnapshot(true);
      setError(null);

      try {
        const response =
          await smartSaveService.getChallengeSnapshot(
            id
          );

        if (
          !isCurrentRequest(requestId)
        ) {
          return response;
        }

        setSnapshot(response);
        setLastUpdated(new Date());

        return response;
      } catch (requestError) {
        const normalizedError =
          normalizeHookError(
            requestError
          );

        if (
          isCurrentRequest(requestId)
        ) {
          setError(normalizedError);
        }

        throw requestError;
      } finally {
        if (
          isCurrentRequest(requestId)
        ) {
          setLoadingSnapshot(false);
        }
      }
    },
    [
      challengeId,
      nextRequestId,
      isCurrentRequest,
    ]
  );

  /* ==========================================================
     FETCH SUMMARY
  ========================================================== */

  const fetchSummary = useCallback(
    async () => {
      const requestId =
        nextRequestId();

      setLoadingSummary(true);
      setError(null);

      try {
        const response =
          await smartSaveService.getSavingsChallengeSummary();

        if (
          !isCurrentRequest(requestId)
        ) {
          return response;
        }

        setSummary(response);
        setLastUpdated(new Date());

        return response;
      } catch (requestError) {
        const normalizedError =
          normalizeHookError(
            requestError
          );

        if (
          isCurrentRequest(requestId)
        ) {
          setError(normalizedError);
        }

        throw requestError;
      } finally {
        if (
          isCurrentRequest(requestId)
        ) {
          setLoadingSummary(false);
        }
      }
    },
    [
      nextRequestId,
      isCurrentRequest,
    ]
  );

  /* ==========================================================
     FETCH ACTIVE CHALLENGES
  ========================================================== */

  const fetchActiveChallenges =
    useCallback(async () => {
      const requestId =
        nextRequestId();

      setLoadingLists(true);
      setError(null);

      try {
        const response =
          await smartSaveService.getActiveSavingsChallenges();

        if (
          !isCurrentRequest(requestId)
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
          isCurrentRequest(requestId)
        ) {
          setError(normalizedError);
        }

        throw requestError;
      } finally {
        if (
          isCurrentRequest(requestId)
        ) {
          setLoadingLists(false);
        }
      }
    }, [
      nextRequestId,
      isCurrentRequest,
    ]);

  /* ==========================================================
     FETCH PAUSED CHALLENGES
  ========================================================== */

  const fetchPausedChallenges =
    useCallback(async () => {
      const requestId =
        nextRequestId();

      setLoadingLists(true);
      setError(null);

      try {
        const response =
          await smartSaveService.getPausedSavingsChallenges();

        if (
          !isCurrentRequest(requestId)
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
          isCurrentRequest(requestId)
        ) {
          setError(normalizedError);
        }

        throw requestError;
      } finally {
        if (
          isCurrentRequest(requestId)
        ) {
          setLoadingLists(false);
        }
      }
    }, [
      nextRequestId,
      isCurrentRequest,
    ]);

  /* ==========================================================
     FETCH COMPLETED CHALLENGES
  ========================================================== */

  const fetchCompletedChallenges =
    useCallback(async () => {
      const requestId =
        nextRequestId();

      setLoadingLists(true);
      setError(null);

      try {
        const response =
          await smartSaveService.getCompletedSavingsChallenges();

        if (
          !isCurrentRequest(requestId)
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
          isCurrentRequest(requestId)
        ) {
          setError(normalizedError);
        }

        throw requestError;
      } finally {
        if (
          isCurrentRequest(requestId)
        ) {
          setLoadingLists(false);
        }
      }
    }, [
      nextRequestId,
      isCurrentRequest,
    ]);

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
           * Refresh collection after a mutation when
           * requested. This keeps UI state synchronized
           * with the backend source of truth.
           */
          if (refresh) {
            await fetchChallenges(
              query
            );
          }

          if (
            refreshSnapshot &&
            challengeId
          ) {
            await fetchSnapshot(
              challengeId
            );
          }

          if (refreshSummary) {
            await fetchSummary();
          }

          if (refreshLists) {
            await Promise.allSettled([
              fetchActiveChallenges(),
              fetchPausedChallenges(),
              fetchCompletedChallenges(),
            ]);
          }

          setLastUpdated(new Date());

          return response;
        } catch (mutationRequestError) {
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
        challengeId,
        fetchChallenges,
        fetchSnapshot,
        fetchSummary,
        fetchActiveChallenges,
        fetchPausedChallenges,
        fetchCompletedChallenges,
        query,
      ]
    );

  /* ==========================================================
     CREATE
  ========================================================== */

  const createChallenge =
    useCallback(
      async (payload) =>
        executeMutation(() =>
          smartSaveService.createSavingsChallenge(
            payload
          )
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
        setQuery((previous) =>
          normalizeQuery({
            ...previous,
            ...updates,
          })
        );
      },
      []
    );

  const resetQuery =
    useCallback(() => {
      setQuery(
        normalizeQuery(
          DEFAULT_QUERY
        )
      );
    }, []);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(async () => {
      const operations = [
        fetchChallenges(query),
        fetchSummary(),
      ];

      if (challengeId) {
        operations.push(
          fetchChallenge(challengeId),
          fetchSnapshot(challengeId)
        );
      }

      await Promise.allSettled(
        operations
      );

      return true;
    }, [
      challengeId,
      fetchChallenges,
      fetchSummary,
      fetchChallenge,
      fetchSnapshot,
      query,
    ]);

  /* ==========================================================
     CLEAR ERRORS
  ========================================================== */

  const clearError =
    useCallback(() => {
      setError(null);
      setMutationError(null);
    }, []);

  /* ==========================================================
     INITIAL FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchChallenges(query);
  }, [
    autoFetch,
    fetchChallenges,
    query,
  ]);

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

    /* Fetch */
    fetchChallenges,
    fetchChallenge,
    fetchSnapshot,
    fetchSummary,

    fetchActiveChallenges,
    fetchPausedChallenges,
    fetchCompletedChallenges,

    /* CRUD */
    createChallenge,
    updateChallenge,

    /* Lifecycle */
    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,
    failChallenge,
    expireChallenge,

    /* Progress */
    applyContribution,
    registerSuccessfulPeriod,
    registerMissedPeriod,

    /* Archive */
    archiveChallenge,
    restoreChallenge,

    /* Query */
    updateQuery,
    resetQuery,

    /* General */
    refresh,
    clearError,
  };
};

export default useSavingsChallenges;