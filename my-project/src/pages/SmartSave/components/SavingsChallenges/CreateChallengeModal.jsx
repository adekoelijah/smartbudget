
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  Loader2,
  Target,
  Trophy,
  X,
} from "lucide-react";

import {
  CHALLENGE_TYPES,
  CHALLENGE_DIFFICULTIES,
} from "../../../../constants/smartSaveConstants";

import {
  normalizeChallengePayload,
} from "../../../../utils/smartSave/savingsNormalizers";

import {
  validateSavingsChallenge,
} from "../../../../utils/smartSave/savingsValidators";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = Object.freeze({
  name: "",
  description: "",
  challengeType: "",
  difficulty: "",
  targetAmount: "",
  startDate: "",
  endDate: "",
  savingPlan: "",
  savingAccount: "",
});

/* =========================================================
   HELPERS
========================================================= */

/**
 * Safely extract an ID from:
 * - string
 * - number
 * - object containing _id
 * - object containing id
 * - object containing value
 */
const getId = (value) => {
  if (value == null) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    return String(
      value?._id ??
        value?.id ??
        value?.value ??
        ""
    );
  }

  return "";
};

/**
 * Create a fresh form object.
 *
 * This function deliberately returns a new object every time.
 */
const createInitialForm = (values = {}) => ({
  ...INITIAL_FORM,

  name:
    typeof values.name === "string"
      ? values.name
      : "",

  description:
    typeof values.description === "string"
      ? values.description
      : "",

  challengeType:
    values.challengeType ?? "",

  difficulty:
    values.difficulty ?? "",

  targetAmount:
    values.targetAmount ?? "",

  startDate:
    values.startDate ?? "",

  endDate:
    values.endDate ?? "",

  savingPlan:
    getId(values.savingPlan),

  savingAccount:
    getId(values.savingAccount),
});

/**
 * Convert constants/options into a predictable
 * [{ value, label }] structure.
 */
const normalizeOptions = (source) => {
  if (Array.isArray(source)) {
    return source
      .map((option) => {
        if (
          option &&
          typeof option === "object"
        ) {
          const value =
            option.value ??
            option.id ??
            option._id ??
            "";

          const label =
            option.label ??
            option.name ??
            option.title ??
            option.value ??
            "";

          if (!value) {
            return null;
          }

          return {
            value: String(value),
            label: String(label),
          };
        }

        if (
          option === null ||
          option === undefined ||
          option === ""
        ) {
          return null;
        }

        return {
          value: String(option),
          label: String(option),
        };
      })
      .filter(Boolean);
  }

  if (
    source &&
    typeof source === "object"
  ) {
    return Object.entries(source)
      .map(([value, label]) => ({
        value: String(value),
        label: String(label),
      }))
      .filter(
        (option) => option.value
      );
  }

  return [];
};

/**
 * Convert the form into the backend payload.
 *
 * Financial/business validation remains in the
 * existing normalizer/validator utilities.
 */
const buildChallengePayload = (form) => {
  const rawPayload = {
    name: form.name.trim(),

    description:
      form.description.trim(),

    challengeType:
      form.challengeType,

    difficulty:
      form.difficulty,

    targetAmount:
      form.targetAmount === ""
        ? undefined
        : Number(form.targetAmount),

    startDate:
      form.startDate || undefined,

    endDate:
      form.endDate || undefined,

    savingPlan:
      getId(form.savingPlan) ||
      undefined,

    savingAccount:
      getId(form.savingAccount) ||
      undefined,
  };

  return normalizeChallengePayload(
    rawPayload
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const CreateChallengeModal = ({
  open = false,
  onClose,
  onSubmit,
  creating = false,
  error = null,
  savingPlans = [],
  savingAccounts = [],
  initialValues = {},
}) => {
  /* =======================================================
     FORM STATE

     IMPORTANT:
     There is NO useEffect here.

     The form is initialized once when the component mounts.
  ======================================================= */

  const [form, setForm] = useState(() =>
    createInitialForm(initialValues)
  );

  const [errors, setErrors] = useState({});

  const [submitError, setSubmitError] =
    useState("");

  /* =======================================================
     OPTIONS
  ======================================================= */

  const challengeTypeOptions = useMemo(
    () =>
      normalizeOptions(
        CHALLENGE_TYPES
      ),
    []
  );

  const difficultyOptions = useMemo(
    () =>
      normalizeOptions(
        CHALLENGE_DIFFICULTIES
      ),
    []
  );

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = useCallback(
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm((previous) => ({
        ...previous,
        [name]: value,
      }));

      setErrors((previous) => {
        if (!previous[name]) {
          return previous;
        }

        const next = {
          ...previous,
        };

        delete next[name];

        return next;
      });

      setSubmitError("");
    },
    []
  );

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose = useCallback(() => {
    if (creating) {
      return;
    }

    setErrors({});
    setSubmitError("");

    /*
     * Reset the temporary form state when the modal
     * is explicitly closed.
     *
     * This is an event-driven state update, not an
     * effect-driven synchronous update.
     */
    setForm(createInitialForm());

    onClose?.();
  }, [
    creating,
    onClose,
  ]);

  /* =======================================================
     BACKDROP
  ======================================================= */

  const handleBackdropClick =
    useCallback(
      (event) => {
        if (creating) {
          return;
        }

        if (
          event.target !==
          event.currentTarget
        ) {
          return;
        }

        handleClose();
      },
      [
        creating,
        handleClose,
      ]
    );

  /* =======================================================
     MODAL CLICK
  ======================================================= */

  const handleModalClick =
    useCallback((event) => {
      event.stopPropagation();
    }, []);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = useCallback(
    (payload) => {
      try {
        const result =
          validateSavingsChallenge(
            payload
          );

        if (result === true) {
          return {};
        }

        if (
          result &&
          typeof result === "object"
        ) {
          return result;
        }

        return {};
      } catch (validationError) {
        console.error(
          "[CreateChallengeModal] Validation failed:",
          validationError
        );

        return {
          form:
            "Unable to validate the challenge. Please check your information.",
        };
      }
    },
    []
  );

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (creating) {
        return;
      }

      if (
        typeof onSubmit !== "function"
      ) {
        const message =
          "Challenge creation is not available right now.";

        console.error(
          "[CreateChallengeModal]",
          message
        );

        setSubmitError(message);

        return;
      }

      setSubmitError("");

      const payload =
        buildChallengePayload(form);

      const validationErrors =
        validateForm(payload);

      if (
        Object.keys(
          validationErrors
        ).length > 0
      ) {
        setErrors(validationErrors);
        return;
      }

      try {
        await onSubmit(payload);

        /*
         * Submission succeeded.
         *
         * These state updates happen because of a user
         * submit event, so they are not the problematic
         * synchronous effect updates.
         */
        setForm(createInitialForm());
        setErrors({});
        setSubmitError("");
      } catch (submitErrorValue) {
        console.error(
          "[CreateChallengeModal] Failed to submit challenge:",
          submitErrorValue
        );

        setSubmitError(
          submitErrorValue?.response
            ?.data?.message ??
            submitErrorValue?.message ??
            "Unable to create the savings challenge. Please try again."
        );
      }
    },
    [
      creating,
      onSubmit,
      form,
      validateForm,
    ]
  );

  /* =======================================================
     ESCAPE KEY

     This effect is legitimate because it synchronizes
     React state with the browser's external event system.
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !creating
      ) {
        handleClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    creating,
    handleClose,
  ]);

  /* =======================================================
     BODY SCROLL LOCK

     This effect is also legitimate because it synchronizes
     React with the browser DOM.
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* =======================================================
     ERROR
  ======================================================= */

  const visibleError =
    submitError ||
    (typeof error === "string"
      ? error
      : error?.message || "");

  /* =======================================================
     CLOSED STATE
  ======================================================= */

  if (!open) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        p-4
        bg-black/50
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-challenge-title"
      onClick={handleBackdropClick}
    >
      <div
        className="
          relative flex flex-col overflow-hidden
          w-full max-w-2xl max-h-[92vh]
          bg-white
          rounded-2xl
          shadow-2xl
        "
        onClick={handleModalClick}
      >
        {/* HEADER */}

        <div
          className="
            flex items-center justify-between
            px-5 sm:px-6 py-4
            border-b border-slate-200
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex items-center justify-center
                w-10 h-10
                text-blue-600
                bg-blue-50
                rounded-xl
                shrink-0
              "
              aria-hidden="true"
            >
              <Trophy size={20} />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id="create-challenge-title"
                className="
                  font-semibold text-slate-900 text-base
                "
              >
                Create Savings Challenge
              </h2>

              <p
                className="
                  mt-0.5
                  text-slate-500 text-sm
                "
              >
                Set a measurable savings
                target and build consistency.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={creating}
            className="
              p-2
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
            aria-label="Close modal"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="
            flex flex-col flex-1
            min-h-0
          "
        >
          <div
            className="
              flex-1 overflow-y-auto
              px-5 sm:px-6 py-5
            "
          >
            {/* GENERAL ERROR */}

            {visibleError ? (
              <div
                className="
                  flex items-start
                  mb-5 px-4 py-3
                  text-red-700 text-sm
                  bg-red-50
                  border border-red-200 rounded-xl
                  gap-3
                "
                role="alert"
              >
                <AlertCircle
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                  aria-hidden="true"
                /
                >

                <span>
                  {visibleError}
                </span>
              </div>
            ) : null}

            {/* FORM ERROR */}

            {errors.form ? (
              <p
                className="
                  mb-4
                  text-red-600 text-xs
                "
                role="alert"
              >
                {errors.form}
              </p>
            ) : null}

            <div
              className="
                space-y-5
              "
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="challenge-name"
                  className="
                    block
                    mb-1.5
                    font-medium text-slate-700 text-sm
                  "
                >
                  Challenge name
                </label>

                <input
                  id="challenge-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={creating}
                  autoComplete="off"
                  maxLength={120}
                  placeholder="e.g. Emergency Fund Challenge"
                  aria-invalid={Boolean(
                    errors.name
                  )}
                  className={`
                    w-full
                    px-3.5 py-2.5
                    text-sm
                    text-slate-900
                    placeholder:text-slate-400
                    border
                    rounded-xl
                    outline-none
                    transition
                    disabled:bg-slate-50
                    focus:ring-2
                    ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    }
                  `}
                />

                {errors.name ? (
                  <p
                    className="
                      mt-1.5
                      text-red-600 text-xs
                    "
                    role="alert"
                  >
                    {errors.name}
                  </p>
                ) : null}
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="challenge-description"
                  className="
                    block
                    mb-1.5
                    font-medium text-slate-700 text-sm
                  "
                >
                  Description
                </label>

                <textarea
                  id="challenge-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={creating}
                  rows={3}
                  maxLength={500}
                  placeholder="What are you saving towards?"
                  className="
                    w-full
                    px-3.5 py-2.5
                    text-slate-900 placeholder:text-slate-400 text-sm
                    disabled:bg-slate-50
                    border border-slate-200 focus:border-blue-500 rounded-xl
                    outline-none focus:ring-2 focus:ring-blue-100
                    transition
                    resize-none
                  "
                  /
                >

                {errors.description ? (
                  <p
                    className="
                      mt-1.5
                      text-red-600 text-xs
                    "
                    role="alert"
                  >
                    {errors.description}
                  </p>
                ) : null}
              </div>

              {/* TYPE / DIFFICULTY */}

              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2
                  gap-4
                "
              >
                <div>
                  <label
                    htmlFor="challenge-type"
                    className="
                      block
                      mb-1.5
                      font-medium text-slate-700 text-sm
                    "
                  >
                    Challenge type
                  </label>

                  <select
                    id="challenge-type"
                    name="challengeType"
                    value={form.challengeType}
                    onChange={handleChange}
                    disabled={creating}
                    className="
                      w-full
                      px-3.5 py-2.5
                      text-slate-900 text-sm
                      bg-white disabled:bg-slate-50
                      border border-slate-200 focus:border-blue-500 rounded-xl
                      outline-none focus:ring-2 focus:ring-blue-100
                    "
                  >
                    <option value="">
                      Select challenge type
                    </option>

                    {challengeTypeOptions.map(
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

                  {errors.challengeType ? (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                      role="alert"
                    >
                      {
                        errors.challengeType
                      }
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="challenge-difficulty"
                    className="
                      block
                      mb-1.5
                      font-medium text-slate-700 text-sm
                    "
                  >
                    Difficulty
                  </label>

                  <select
                    id="challenge-difficulty"
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    disabled={creating}
                    className="
                      w-full
                      px-3.5 py-2.5
                      text-slate-900 text-sm
                      bg-white disabled:bg-slate-50
                      border border-slate-200 focus:border-blue-500 rounded-xl
                      outline-none focus:ring-2 focus:ring-blue-100
                    "
                  >
                    <option value="">
                      Select difficulty
                    </option>

                    {difficultyOptions.map(
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

                  {errors.difficulty ? (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                      role="alert"
                    >
                      {errors.difficulty}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* TARGET */}

              <div>
                <label
                  htmlFor="challenge-target"
                  className="
                    block
                    mb-1.5
                    font-medium text-slate-700 text-sm
                  "
                >
                  Target amount
                </label>

                <div
                  className="
                    relative
                  "
                >
                  <Target
                    size={18}
                    className="
                      absolute top-1/2 left-3
                      text-slate-400
                      pointer-events-none
                      -translate-y-1/2
                    "
                    aria-hidden="true"
                  /
                  >

                  <input
                    id="challenge-target"
                    name="targetAmount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={form.targetAmount}
                    onChange={handleChange}
                    disabled={creating}
                    placeholder="0.00"
                    aria-invalid={Boolean(
                      errors.targetAmount
                    )}
                    className={`
                      w-full
                      py-2.5
                      pl-10
                      pr-3.5
                      text-sm
                      text-slate-900
                      placeholder:text-slate-400
                      border
                      rounded-xl
                      outline-none
                      transition
                      disabled:bg-slate-50
                      focus:ring-2
                      ${
                        errors.targetAmount
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }
                    `}
                  />
                </div>

                {errors.targetAmount ? (
                  <p
                    className="
                      mt-1.5
                      text-red-600 text-xs
                    "
                    role="alert"
                  >
                    {errors.targetAmount}
                  </p>
                ) : null}
              </div>

              {/* DATES */}

              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2
                  gap-4
                "
              >
                <div>
                  <label
                    htmlFor="challenge-start-date"
                    className="
                      block
                      mb-1.5
                      font-medium text-slate-700 text-sm
                    "
                  >
                    Start date
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
                    <CalendarDays
                      size={18}
                      className="
                        absolute top-1/2 left-3
                        text-slate-400
                        pointer-events-none
                        -translate-y-1/2
                      "
                      aria-hidden="true"
                    /
                    >

                    <input
                      id="challenge-start-date"
                      name="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleChange}
                      disabled={creating}
                      className="
                        w-full
                        py-2.5 pr-3.5 pl-10
                        text-slate-900 text-sm
                        bg-white disabled:bg-slate-50
                        border border-slate-200 focus:border-blue-500 rounded-xl
                        outline-none focus:ring-2 focus:ring-blue-100
                      "
                      /
                    >
                  </div>

                  {errors.startDate ? (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                      role="alert"
                    >
                      {errors.startDate}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="challenge-end-date"
                    className="
                      block
                      mb-1.5
                      font-medium text-slate-700 text-sm
                    "
                  >
                    End date
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
                    <CalendarDays
                      size={18}
                      className="
                        absolute top-1/2 left-3
                        text-slate-400
                        pointer-events-none
                        -translate-y-1/2
                      "
                      aria-hidden="true"
                    /
                    >

                    <input
                      id="challenge-end-date"
                      name="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={handleChange}
                      disabled={creating}
                      className="
                        w-full
                        py-2.5 pr-3.5 pl-10
                        text-slate-900 text-sm
                        bg-white disabled:bg-slate-50
                        border border-slate-200 focus:border-blue-500 rounded-xl
                        outline-none focus:ring-2 focus:ring-blue-100
                      "
                      /
                    >
                  </div>

                  {errors.endDate ? (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                      role="alert"
                    >
                      {errors.endDate}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* PLAN / ACCOUNT */}

              <div
                className="
                  grid grid-cols-1 sm:grid-cols-2
                  gap-4
                "
              >
                <div>
                  <label
                    htmlFor="challenge-plan"
                    className="
                      block
                      mb-1.5
                      font-medium text-slate-700 text-sm
                    "
                  >
                    Saving plan
                  </label>

                  <select
                    id="challenge-plan"
                    name="savingPlan"
                    value={getId(
                      form.savingPlan
                    )}
                    onChange={handleChange}
                    disabled={creating}
                    className="
                      w-full
                      px-3.5 py-2.5
                      text-slate-900 text-sm
                      bg-white disabled:bg-slate-50
                      border border-slate-200 focus:border-blue-500 rounded-xl
                      outline-none focus:ring-2 focus:ring-blue-100
                    "
                  >
                    <option value="">
                      No saving plan
                    </option>

                    {Array.isArray(
                      savingPlans
                    )
                      ? savingPlans.map(
                          (plan) => {
                            const id =
                              getId(plan);

                            if (!id) {
                              return null;
                            }

                            return (
                              <option
                                key={id}
                                value={id}
                              >
                                {plan?.name ||
                                  plan?.title ||
                                  `Plan ${id}`}
                              </option>
                            );
                          }
                        )
                      : null}
                  </select>

                  {errors.savingPlan ? (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                      role="alert"
                    >
                      {errors.savingPlan}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="challenge-account"
                    className="
                      block
                      mb-1.5
                      font-medium text-slate-700 text-sm
                    "
                  >
                    Saving account
                  </label>

                  <select
                    id="challenge-account"
                    name="savingAccount"
                    value={getId(
                      form.savingAccount
                    )}
                    onChange={handleChange}
                    disabled={creating}
                    className="
                      w-full
                      px-3.5 py-2.5
                      text-slate-900 text-sm
                      bg-white disabled:bg-slate-50
                      border border-slate-200 focus:border-blue-500 rounded-xl
                      outline-none focus:ring-2 focus:ring-blue-100
                    "
                  >
                    <option value="">
                      No saving account
                    </option>

                    {Array.isArray(
                      savingAccounts
                    )
                      ? savingAccounts.map(
                          (account) => {
                            const id =
                              getId(account);

                            if (!id) {
                              return null;
                            }

                            return (
                              <option
                                key={id}
                                value={id}
                              >
                                {account?.name ||
                                  account?.title ||
                                  `Account ${id}`}
                              </option>
                            );
                          }
                        )
                      : null}
                  </select>

                  {errors.savingAccount ? (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                      role="alert"
                    >
                      {
                        errors.savingAccount
                      }
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div
            className="
              flex flex-col-reverse sm:flex-row sm:justify-end
              px-5 sm:px-6 py-4
              bg-slate-50
              border-t border-slate-200
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="
                inline-flex items-center justify-center
                px-4 py-2.5
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-100
                border border-slate-200 rounded-xl focus:outline-none
                focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 transition
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="
                inline-flex items-center justify-center
                px-5 py-2.5
                font-semibold text-white text-sm
                bg-slate-900 hover:bg-slate-800
                rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500
                disabled:opacity-60 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              {creating ? (
                <>
                  <Loader2
                    size={17}
                    className="
                      animate-spin
                    "
                    aria-hidden="true"
                  /
                  >

                  Creating...
                </>
              ) : (
                <>
                  <Check
                    size={17}
                    aria-hidden="true"
                  />

                  Create Challenge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallengeModal;
