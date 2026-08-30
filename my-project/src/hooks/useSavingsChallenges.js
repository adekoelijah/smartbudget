// hooks/useSavingsChallenges.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import smartSaveService from "../services/smartSaveService";

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const DEFAULT_QUERY = Object.freeze({
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
});

const INITIAL_COLLECTION = Object.freeze({
  items: [],
  pagination: null,
  meta: null,
});

const normalizeHookError = (error) => {
  if (!error) {
    return null;
  }

  return {
    message:
      error?.message ||
      "Unable to complete the savings challenge request.",

    code:
      error?.code ||
      "SAVINGS_CHALLENGE_ERROR",

    status:
      error?.status ??
      error?.statusCode ??
      error?.response?.status ??
      null,

    details:
      error?.details ??
      error?.response?.data ??
      null,

    originalError: error,
  };
};

/* ============================================================
   QUERY NORMALIZATION
============================================================ */

const normalizeQuery = (query = {}) => {
  const pageNumber = Number(query.page);
  const limitNumber = Number(query.limit);

  return {
    page:
      Number.isInteger(pageNumber) &&
      pageNumber > 0
        ? pageNumber
        : DEFAULT_PAGE,

    limit:
      Number.isInteger(limitNumber) &&
      limitNumber > 0
        ? limitNumber
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

    ...(typeof query.includeTemplates ===
    "boolean"
      ? {
          includeTemplates:
            query.includeTemplates,
        }
      : {}),
  };
};

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
    return {
      ...INITIAL_COLLECTION,
      items: [],
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: null,
      meta: null,
    };
  }

  const items =
    response?.items ??
    response?.challenges ??
    response?.data ??
    [];

  return {
    items: Array.isArray(items)
      ? items
      : [],

    pagination:
      response?.pagination ??
      response?.meta?.pagination ??
      null,

    meta:
      response?.meta ??
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
    useState(null);

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
    useState(null);

  const [mutationError, setMutationError] =
    useState(null);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  /* ==========================================================
     REFS
  ========================================================== */

  const mountedRef =
    useRef(false);

  const queryRef =
    useRef(query);

  const challengeIdRef =
    useRef(challengeId);

  /* ==========================================================
     MOUNT
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ==========================================================
     SYNC REFS
  ========================================================== */

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    challengeIdRef.current =
      challengeId;
  }, [challengeId]);

  /* ==========================================================
     REQUEST SEQUENCES
  ========================================================== */

  const requestIdsRef =
    useRef({
      challenges: 0,
      challenge: 0,
      snapshot: 0,
      summary: 0,
      active: 0,
      paused: 0,
      completed: 0,
    });

  const nextRequestId = useCallback(
    (resource) => {
      requestIdsRef.current[
        resource
      ] += 1;

      return requestIdsRef.current[
        resource
      ];
    },
    []
  );

  const isCurrentRequest =
    useCallback(
      (
        resource,
        requestId
      ) =>
        mountedRef.current &&
        requestIdsRef.current[
          resource
        ] === requestId,
      []
    );

  /* ==========================================================
     FETCH CHALLENGES
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
          nextRequestId(
            "challenges"
          );

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
            !isCurrentRequest(
              "challenges",
              requestId
            )
          ) {
            return response;
          }

          setCollection(
            normalizeCollectionResponse(
              response
            )
          );

          setLastUpdated(
            new Date()
          );

          return response;
        } catch (requestError) {
          if (
            isCurrentRequest(
              "challenges",
              requestId
            )
          ) {
            setError(
              normalizeHookError(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentRequest(
              "challenges",
              requestId
            )
          ) {
            setLoading(false);
          }
        }
      },
      [
        nextRequestId,
        isCurrentRequest,
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
          nextRequestId(
            "challenge"
          );

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
            !isCurrentRequest(
              "challenge",
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
          if (
            isCurrentRequest(
              "challenge",
              requestId
            )
          ) {
            setError(
              normalizeHookError(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentRequest(
              "challenge",
              requestId
            )
          ) {
            setLoadingChallenge(false);
          }
        }
      },
      [
        nextRequestId,
        isCurrentRequest,
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
          nextRequestId(
            "snapshot"
          );

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
            !isCurrentRequest(
              "snapshot",
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
          if (
            isCurrentRequest(
              "snapshot",
              requestId
            )
          ) {
            setError(
              normalizeHookError(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentRequest(
              "snapshot",
              requestId
            )
          ) {
            setLoadingSnapshot(false);
          }
        }
      },
      [
        nextRequestId,
        isCurrentRequest,
      ]
    );

  /* ==========================================================
     FETCH SUMMARY
  ========================================================== */

  const fetchSummary =
    useCallback(
      async () => {
        const requestId =
          nextRequestId(
            "summary"
          );

        if (!mountedRef.current) {
          return null;
        }

        setLoadingSummary(true);

        try {
          const response =
            await smartSaveService.getSavingsChallengeSummary();

          if (
            !isCurrentRequest(
              "summary",
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
          if (
            isCurrentRequest(
              "summary",
              requestId
            )
          ) {
            setError(
              normalizeHookError(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentRequest(
              "summary",
              requestId
            )
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
     FETCH ACTIVE
  ========================================================== */

  const fetchActiveChallenges =
    useCallback(
      async () => {
        const requestId =
          nextRequestId("active");

        if (!mountedRef.current) {
          return null;
        }

        setLoadingActive(true);

        try {
          const response =
            await smartSaveService.getActiveSavingsChallenges();

          if (
            !isCurrentRequest(
              "active",
              requestId
            )
          ) {
            return response;
          }

          setActiveChallenges(
            normalizeCollectionResponse(
              response
            ).items
          );

          return response;
        } catch (requestError) {
          if (
            isCurrentRequest(
              "active",
              requestId
            )
          ) {
            setError(
              normalizeHookError(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentRequest(
              "active",
              requestId
            )
          ) {
            setLoadingActive(false);
          }
        }
      },
      [
        nextRequestId,
        isCurrentRequest,
      ]
    );

  /* ==========================================================
     FETCH PAUSED
  ========================================================== */

  const fetchPausedChallenges =
    useCallback(
      async () => {
        const requestId =
          nextRequestId("paused");

        if (!mountedRef.current) {
          return null;
        }

        setLoadingPaused(true);

        try {
          const response =
            await smartSaveService.getPausedSavingsChallenges();

          if (
            !isCurrentRequest(
              "paused",
              requestId
            )
          ) {
            return response;
          }

          setPausedChallenges(
            normalizeCollectionResponse(
              response
            ).items
          );

          return response;
        } catch (requestError) {
          if (
            isCurrentRequest(
              "paused",
              requestId
            )
          ) {
            setError(
              normalizeHookError(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentRequest(
              "paused",
              requestId
            )
          ) {
            setLoadingPaused(false);
          }
        }
      },
      [
        nextRequestId,
        isCurrentRequest,
      ]
    );

  /* ==========================================================
     FETCH COMPLETED
  ========================================================== */

  const fetchCompletedChallenges =
    useCallback(
      async () => {
        const requestId =
          nextRequestId(
            "completed"
          );

        if (!mountedRef.current) {
          return null;
        }

        setLoadingCompleted(true);

        try {
          const response =
            await smartSaveService.getCompletedSavingsChallenges();

          if (
            !isCurrentRequest(
              "completed",
              requestId
            )
          ) {
            return response;
          }

          setCompletedChallenges(
            normalizeCollectionResponse(
              response
            ).items
          );

          return response;
        } catch (requestError) {
          if (
            isCurrentRequest(
              "completed",
              requestId
            )
          ) {
            setError(
              normalizeHookError(
                requestError
              )
            );
          }

          throw requestError;
        } finally {
          if (
            isCurrentRequest(
              "completed",
              requestId
            )
          ) {
            setLoadingCompleted(false);
          }
        }
      },
      [
        nextRequestId,
        isCurrentRequest,
      ]
    );

  /* ==========================================================
     MUTATION ENGINE
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

        let response;

        /* ------------------------------------------------------
           ACTUAL MUTATION
        ------------------------------------------------------ */

        try {
          response =
            await mutation();
        } catch (mutationErrorValue) {
          if (mountedRef.current) {
            setMutationError(
              normalizeHookError(
                mutationErrorValue
              )
            );
          }

          throw mutationErrorValue;
        } finally {
          if (mountedRef.current) {
            setMutating(false);
          }
        }

        /* ------------------------------------------------------
           MUTATION SUCCEEDED

           Refreshes are deliberately separate from the
           mutation itself.

           A failed refresh must NOT turn a successful
           creation/update into a failed mutation.
        ------------------------------------------------------ */

        if (!mountedRef.current) {
          return response;
        }

        const refreshOperations = [];

        if (refresh) {
          refreshOperations.push(
            fetchChallenges(
              queryRef.current
            )
          );
        }

        if (
          refreshSnapshot &&
          challengeIdRef.current
        ) {
          refreshOperations.push(
            fetchSnapshot(
              challengeIdRef.current
            )
          );
        }

        if (refreshSummary) {
          refreshOperations.push(
            fetchSummary()
          );
        }

        if (refreshLists) {
          refreshOperations.push(
            fetchActiveChallenges(),
            fetchPausedChallenges(),
            fetchCompletedChallenges()
          );
        }

        if (
          refreshOperations.length
        ) {
          await Promise.allSettled(
            refreshOperations
          );
        }

        if (mountedRef.current) {
          setLastUpdated(
            new Date()
          );
        }

        return response;
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

  const createChallenge =
    useCallback(
      async (
        payload,
        options = {}
      ) =>
        executeMutation(
          () =>
            smartSaveService.createSavingsChallenge(
              payload
            ),
          {
            refresh: true,
            refreshSnapshot: false,
            refreshSummary: true,
            refreshLists: false,
            ...options,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     UPDATE
  ========================================================== */

  const updateChallenge =
    useCallback(
      async (
        id,
        payload,
        options = {}
      ) =>
        executeMutation(
          () =>
            smartSaveService.updateSavingsChallenge(
              id,
              payload
            ),
          {
            refresh: true,
            refreshSnapshot: true,
            refreshSummary: true,
            refreshLists: false,
            ...options,
          }
        ),
      [executeMutation]
    );

  /* ==========================================================
     LIFECYCLE OPERATIONS
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
     CONTRIBUTIONS
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
     ARCHIVE / RESTORE
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

          return areQueriesEqual(
            previous,
            next
          )
            ? previous
            : next;
        });
      },
      []
    );

  const resetQuery =
    useCallback(() => {
      const next =
        normalizeQuery(
          DEFAULT_QUERY
        );

      setQuery((previous) =>
        areQueriesEqual(
          previous,
          next
        )
          ? previous
          : next
      );
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
     CLEAR ERROR
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
     AUTO FETCH
  ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    void fetchChallenges(query);
  }, [
    autoFetch,
    query,
    fetchChallenges,
  ]);

  /* ==========================================================
     DERIVED VALUES
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

  const loadingLists =
    loadingActive ||
    loadingPaused ||
    loadingCompleted;

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
     STABLE STATE
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
     PUBLIC API
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