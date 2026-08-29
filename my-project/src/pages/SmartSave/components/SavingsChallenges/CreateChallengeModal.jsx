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

import useSavingsChallenges from "../../../../hooks/useSavingsChallenges";

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

const getId = (value) => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value._id ??
      value.id ??
      value.value ??
      ""
    );
  }

  return "";
};

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

const normalizeOptions = (source) => {
  if (Array.isArray(source)) {
    return source.map((option) => {
      if (
        option &&
        typeof option === "object"
      ) {
        return {
          value:
            option.value ??
            option.id ??
            option._id ??
            "",
          label:
            option.label ??
            option.name ??
            option.title ??
            option.value ??
            "",
        };
      }

      return {
        value: option,
        label: String(option),
      };
    });
  }

  if (
    source &&
    typeof source === "object"
  ) {
    return Object.entries(source).map(
      ([value, label]) => ({
        value,
        label: String(label),
      })
    );
  }

  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

const CreateChallengeModal = ({
  isOpen,
  onClose,
  onCreated,

  savingPlans = [],
  savingAccounts = [],

  initialValues = {},
}) => {
 const {
  createChallenge,
  creating,
  error: challengeError,
} = useSavingsChallenges({
  autoFetch: false,
});

  /* =======================================================
     LOCAL STATE
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
    () => normalizeOptions(CHALLENGE_TYPES),
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

    onClose?.();
  }, [
    creating,
    onClose,
  ]);

  /* =======================================================
     PAYLOAD
  ======================================================= */

  const buildChallengePayload = (form) => {
  const rawPayload = {
    name: form.name.trim(),
    description: form.description.trim(),
    challengeType: form.challengeType,
    difficulty: form.difficulty,
    targetAmount:
      form.targetAmount === ""
        ? undefined
        : Number(form.targetAmount),
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    savingPlan: getId(form.savingPlan) || undefined,
    savingAccount: getId(form.savingAccount) || undefined,
  };

  return normalizeChallengePayload(rawPayload);
};



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
      } catch (error) {
        console.error(
          "CREATE_CHALLENGE_VALIDATION_ERROR:",
          error
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

      setSubmitError("");

      const payload = buildChallengePayload(form);

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
        const created = await createChallenge(payload, {
  refresh: false,
  refreshSnapshot: false,
  refreshSummary: false,
  refreshLists: false,
});

        /*
         * Notify parent before closing so the
         * parent can update its collection.
         */
        onCreated?.(created);

        /*
         * Explicitly reset local state.
         * No reset callback is required.
         */
        setForm(
          createInitialForm(
            initialValues
          )
        );

        setErrors({});
        setSubmitError("");

        onClose?.();
      } catch (error) {
        console.error(
          "CREATE_CHALLENGE_ERROR:",
          error
        );

        setSubmitError(
          error?.message ||
            "Unable to create the savings challenge. Please try again."
        );
      }
    },
    [
      
      creating,
      buildChallengePayload,
      validateForm,
      createChallenge,
      onCreated,
      initialValues,
      onClose,
    ]
  );

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (
        event.key !== "Escape" ||
        creating
      ) {
        return;
      }

      handleClose();
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
    isOpen,
    creating,
    handleClose,
  ]);

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen]);

  /* =======================================================
     ERROR RESOLUTION
  ======================================================= */

  const visibleError =
    submitError ||
    (
      typeof challengeError ===
      "string"
        ? challengeError
        : challengeError?.message || ""
    );

  /* =======================================================
     BACKDROP
  ======================================================= */



  /* =========================================================
   MODAL INTERACTION HANDLERS
========================================================= */

const handleBackdropClick = useCallback(
  (event) => {
    if (creating) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    handleClose();
  },
  [creating, handleClose]
);

const handleModalClick = useCallback((event) => {
  event.stopPropagation();
}, []);


  /* =======================================================
     CLOSED STATE
  ======================================================= */

  if (!isOpen) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-challenge-title"
      onClick={handleBackdropClick}
    >
      <div
        className="relative flex flex-col bg-white shadow-2xl rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden"
        onClick={handleModalClick}
      >
        {/* HEADER */}

        <div
          className="flex justify-between items-center px-5 sm:px-6 py-4 border-slate-200 border-b"
        >
          <div
            className="flex items-center gap-3 min-w-0"
          >
            <div
              className="flex justify-center items-center bg-blue-50 rounded-xl w-10 h-10 text-blue-600 shrink-0"
              aria-hidden="true"
            >
              <Trophy size={20} />
            </div>

            <div
              className="min-w-0"
            >
              <h2
                id="create-challenge-title"
                className="font-semibold text-slate-900 text-base"
              >
                Create Savings Challenge
              </h2>

              <p
                className="mt-0.5 text-slate-500 text-sm"
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
            className="hover:bg-slate-100 disabled:opacity-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 hover:text-slate-700 transition disabled:cursor-not-allowed shrink-0"
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
          className="flex flex-col flex-1 min-h-0"
        >
          <div
            className="flex-1 px-5 sm:px-6 py-5 overflow-y-auto"
          >
            {visibleError && (
              <div
                className="flex items-start gap-3 bg-red-50 mb-5 px-4 py-3 border border-red-200 rounded-xl text-red-700 text-sm"
                role="alert"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                /
                >

                <span>
                  {visibleError}
                </span>
              </div>
            )}

            {errors.form && (
              <p
                className="mb-4 text-red-600 text-xs"
                role="alert"
              >
                {errors.form}
              </p>
            )}

            <div
              className="space-y-5"
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="challenge-name"
                  className="block mb-1.5 font-medium text-slate-700 text-sm"
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
                  aria-invalid={
                    Boolean(errors.name)
                  }
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

                {errors.name && (
                  <p
                    className="mt-1.5 text-red-600 text-xs"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="challenge-description"
                  className="block mb-1.5 font-medium text-slate-700 text-sm"
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
                  className="disabled:bg-slate-50 px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 placeholder:text-slate-400 text-sm transition resize-none"
                  /
                >
              </div>

              {/* TYPE / DIFFICULTY */}

              <div
                className="gap-4 grid grid-cols-1 sm:grid-cols-2"
              >
                <div>
                  <label
                    htmlFor="challenge-type"
                    className="block mb-1.5 font-medium text-slate-700 text-sm"
                  >
                    Challenge type
                  </label>

                  <select
                    id="challenge-type"
                    name="challengeType"
                    value={
                      form.challengeType
                    }
                    onChange={handleChange}
                    disabled={creating}
                    className="bg-white disabled:bg-slate-50 px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 text-sm"
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

                  {errors.challengeType && (
                    <p
                      className="mt-1.5 text-red-600 text-xs"
                      role="alert"
                    >
                      {
                        errors.challengeType
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="challenge-difficulty"
                    className="block mb-1.5 font-medium text-slate-700 text-sm"
                  >
                    Difficulty
                  </label>

                  <select
                    id="challenge-difficulty"
                    name="difficulty"
                    value={
                      form.difficulty
                    }
                    onChange={handleChange}
                    disabled={creating}
                    className="bg-white disabled:bg-slate-50 px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 text-sm"
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

                  {errors.difficulty && (
                    <p
                      className="mt-1.5 text-red-600 text-xs"
                      role="alert"
                    >
                      {errors.difficulty}
                    </p>
                  )}
                </div>
              </div>

              {/* TARGET */}

              <div>
                <label
                  htmlFor="challenge-target"
                  className="block mb-1.5 font-medium text-slate-700 text-sm"
                >
                  Target amount
                </label>

                <div
                  className="relative"
                >
                  <Target
                    size={18}
                    className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2 pointer-events-none"
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
                    value={
                      form.targetAmount
                    }
                    onChange={handleChange}
                    disabled={creating}
                    placeholder="0.00"
                    aria-invalid={
                      Boolean(
                        errors.targetAmount
                      )
                    }
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

                {errors.targetAmount && (
                  <p
                    className="mt-1.5 text-red-600 text-xs"
                    role="alert"
                  >
                    {
                      errors.targetAmount
                    }
                  </p>
                )}
              </div>

              {/* DATES */}

              <div
                className="gap-4 grid grid-cols-1 sm:grid-cols-2"
              >
                <div>
                  <label
                    htmlFor="challenge-start-date"
                    className="block mb-1.5 font-medium text-slate-700 text-sm"
                  >
                    Start date
                  </label>

                  <div
                    className="relative"
                  >
                    <CalendarDays
                      size={18}
                      className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    /
                    >

                    <input
                      id="challenge-start-date"
                      name="startDate"
                      type="date"
                      value={
                        form.startDate
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className="bg-white disabled:bg-slate-50 py-2.5 pr-3.5 pl-10 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 text-sm"
                      /
                    >
                  </div>

                  {errors.startDate && (
                    <p
                      className="mt-1.5 text-red-600 text-xs"
                      role="alert"
                    >
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="challenge-end-date"
                    className="block mb-1.5 font-medium text-slate-700 text-sm"
                  >
                    End date
                  </label>

                  <div
                    className="relative"
                  >
                    <CalendarDays
                      size={18}
                      className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    /
                    >

                    <input
                      id="challenge-end-date"
                      name="endDate"
                      type="date"
                      value={
                        form.endDate
                      }
                      onChange={
                        handleChange
                      }
                      disabled={creating}
                      className="bg-white disabled:bg-slate-50 py-2.5 pr-3.5 pl-10 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 text-sm"
                      /
                    >
                  </div>

                  {errors.endDate && (
                    <p
                      className="mt-1.5 text-red-600 text-xs"
                      role="alert"
                    >
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* PLAN / ACCOUNT */}

              <div
                className="gap-4 grid grid-cols-1 sm:grid-cols-2"
              >
                <div>
                  <label
                    htmlFor="challenge-plan"
                    className="block mb-1.5 font-medium text-slate-700 text-sm"
                  >
                    Saving plan
                  </label>

                  <select
                    id="challenge-plan"
                    name="savingPlan"
                    value={
                      getId(
                        form.savingPlan
                      )
                    }
                    onChange={handleChange}
                    disabled={creating}
                    className="bg-white disabled:bg-slate-50 px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 text-sm"
                  >
                    <option value="">
                      No saving plan
                    </option>

                    {Array.isArray(
                      savingPlans
                    ) &&
                      savingPlans.map(
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
                      )}
                  </select>

                  {errors.savingPlan && (
                    <p
                      className="mt-1.5 text-red-600 text-xs"
                      role="alert"
                    >
                      {errors.savingPlan}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="challenge-account"
                    className="block mb-1.5 font-medium text-slate-700 text-sm"
                  >
                    Saving account
                  </label>

                  <select
                    id="challenge-account"
                    name="savingAccount"
                    value={
                      getId(
                        form.savingAccount
                      )
                    }
                    onChange={handleChange}
                    disabled={creating}
                    className="bg-white disabled:bg-slate-50 px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 w-full text-slate-900 text-sm"
                  >
                    <option value="">
                      No saving account
                    </option>

                    {Array.isArray(
                      savingAccounts
                    ) &&
                      savingAccounts.map(
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
                      )}
                  </select>

                  {errors.savingAccount && (
                    <p
                      className="mt-1.5 text-red-600 text-xs"
                      role="alert"
                    >
                      {
                        errors.savingAccount
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div
            className="flex sm:flex-row flex-col-reverse sm:justify-end gap-3 bg-slate-50 px-5 sm:px-6 py-4 border-slate-200 border-t"
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="inline-flex justify-center items-center bg-white hover:bg-slate-100 disabled:opacity-50 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 text-sm transition disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 shadow-sm px-5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 font-semibold text-white text-sm transition disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
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