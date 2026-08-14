
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
   DEFAULT FORM
========================================================= */

const INITIAL_FORM = {
  name: "",
  description: "",
  challengeType: "",
  difficulty: "",
  targetAmount: "",
  startDate: "",
  endDate: "",
  savingPlan: "",
  savingAccount: "",
};


/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return (
    value?._id ||
    value?.id ||
    value?.value ||
    ""
  );
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
  } = useSavingsChallenges();


  /* =======================================================
     LOCAL FORM STATE
  ======================================================= */

  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ...initialValues,
  }));

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");


  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = useCallback(() => {
    setForm({
      ...INITIAL_FORM,
      ...initialValues,
    });

    setErrors({});
    setSubmitError("");
  }, [initialValues]);


  /* =======================================================
     INPUT HANDLER
  ======================================================= */

  const handleChange = useCallback((event) => {
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
  }, []);


  /* =======================================================
     CLOSE HANDLER
  ======================================================= */

  const handleClose = useCallback(() => {
    if (creating) return;

    resetForm();
    onClose?.();
  }, [
    creating,
    resetForm,
    onClose,
  ]);


  /* =======================================================
     NORMALIZED OPTIONS
  ======================================================= */

  const challengeTypeOptions = useMemo(() => {
    if (Array.isArray(CHALLENGE_TYPES)) {
      return CHALLENGE_TYPES;
    }

    if (
      CHALLENGE_TYPES &&
      typeof CHALLENGE_TYPES === "object"
    ) {
      return Object.entries(CHALLENGE_TYPES).map(
        ([value, label]) => ({
          value,
          label,
        })
      );
    }

    return [];
  }, []);


  const difficultyOptions = useMemo(() => {
    if (Array.isArray(CHALLENGE_DIFFICULTIES)) {
      return CHALLENGE_DIFFICULTIES;
    }

    if (
      CHALLENGE_DIFFICULTIES &&
      typeof CHALLENGE_DIFFICULTIES === "object"
    ) {
      return Object.entries(
        CHALLENGE_DIFFICULTIES
      ).map(([value, label]) => ({
        value,
        label,
      }));
    }

    return [];
  }, []);


  /* =======================================================
     PAYLOAD
  ======================================================= */

  const buildPayload = useCallback(() => {
    const rawPayload = {
      name: form.name.trim(),
      description: form.description.trim(),

      challengeType: form.challengeType,
      difficulty: form.difficulty,

      targetAmount:
        form.targetAmount === ""
          ? undefined
          : Number(form.targetAmount),

      startDate:
        form.startDate || undefined,

      endDate:
        form.endDate || undefined,

      savingPlan:
        getId(form.savingPlan) || undefined,

      savingAccount:
        getId(form.savingAccount) || undefined,
    };

    return normalizeChallengePayload(rawPayload);
  }, [form]);


  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = useCallback(
    (payload) => {
      try {
        const result =
          validateSavingsChallenge(payload);

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
      } catch {
        return {};
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

      if (creating) return;

      setSubmitError("");

      const payload = buildPayload();

      const validationErrors =
        validateForm(payload);

      if (
        validationErrors &&
        Object.keys(validationErrors).length
      ) {
        setErrors(validationErrors);
        return;
      }

      try {
        const created =
          await createChallenge(payload);

        onCreated?.(created);

        resetForm();
        onClose?.();
      } catch (error) {
        setSubmitError(
          error?.message ||
            "Unable to create the savings challenge. Please try again."
        );
      }
    },
    [
      creating,
      buildPayload,
      validateForm,
      createChallenge,
      onCreated,
      resetForm,
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
      if (event.key !== "Escape") {
        return;
      }

      if (!creating) {
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
    challengeError?.message ||
    (
      typeof challengeError === "string"
        ? challengeError
        : ""
    );


  /* =======================================================
     RENDER
  ======================================================= */

  if (!isOpen) {
    return null;
  }


  /* =======================================================
     BACKDROP HANDLER
  ======================================================= */

  const handleBackdropMouseDown = (event) => {
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
  };


  return (
    <div
      className="
        z-50 fixed inset-0 flex justify-center items-center
        p-4
        bg-black/50
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-challenge-title"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="
          relative flex flex-col overflow-hidden
          w-full max-w-2xl max-h-[92vh]
          bg-white
          rounded-2xl
          shadow-2xl
        "
        onMouseDown={handleBackdropMouseDown}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex justify-between items-center
            px-5 sm:px-6 py-4
            border-slate-200 border-b
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
                text-blue-600
                bg-blue-50
                rounded-xl
              "
            >
              <Trophy
                size={20}
                aria-hidden="true"
              />
            </div>

            <div>
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
                Set a measurable savings target
                and build consistency.
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
              rounded-lg
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
            "
            aria-label="Close modal"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>


        {/* =================================================
            FORM
        ================================================= */}

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
            {/* =============================================
                API ERROR
            ============================================= */}

            {visibleError && (
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
            )}


            {/* =============================================
                BASIC INFORMATION
            ============================================= */}

            <div
              className="
                space-y-5
              "
            >
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
                  className={`
                    w-full
                    rounded-xl
                    border
                    px-3.5 py-2.5
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:ring-2
                    disabled:bg-slate-50

                    ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    }
                  `}
                />

                {errors.name && (
                  <p
                    className="
                      mt-1.5
                      text-red-600 text-xs
                    "
                  >
                    {errors.name}
                  </p>
                )}
              </div>


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
              </div>


              {/* ===========================================
                  TYPE / DIFFICULTY
              =========================================== */}

              <div
                className="
                  grid sm:grid-cols-2
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
                          key={
                            option?.value ??
                            option
                          }
                          value={
                            option?.value ??
                            option
                          }
                        >
                          {option?.label ??
                            option}
                        </option>
                      )
                    )}
                  </select>

                  {errors.challengeType && (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                    >
                      {errors.challengeType}
                    </p>
                  )}
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
                          key={
                            option?.value ??
                            option
                          }
                          value={
                            option?.value ??
                            option
                          }
                        >
                          {option?.label ??
                            option}
                        </option>
                      )
                    )}
                  </select>

                  {errors.difficulty && (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                    >
                      {errors.difficulty}
                    </p>
                  )}
                </div>
              </div>


              {/* ===========================================
                  TARGET
              =========================================== */}

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
                      top-1/2 left-3 absolute
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
                    className={`
                      w-full
                      rounded-xl
                      border
                      py-2.5
                      pl-10
                      pr-3.5
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:ring-2
                      disabled:bg-slate-50

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
                    className="
                      mt-1.5
                      text-red-600 text-xs
                    "
                  >
                    {errors.targetAmount}
                  </p>
                )}
              </div>


              {/* ===========================================
                  DATES
              =========================================== */}

              <div
                className="
                  grid sm:grid-cols-2
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
                        top-1/2 left-3 absolute
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

                  {errors.startDate && (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                    >
                      {errors.startDate}
                    </p>
                  )}
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
                        top-1/2 left-3 absolute
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

                  {errors.endDate && (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                    >
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>


              {/* ===========================================
                  SAVING PLAN / ACCOUNT
              =========================================== */}

              <div
                className="
                  grid sm:grid-cols-2
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
                    value={getId(form.savingPlan)}
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

                    {savingPlans.map((plan) => {
                      const id = getId(plan);

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
                    })}
                  </select>

                  {errors.savingPlan && (
                    <p
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                    >
                      {errors.savingPlan}
                    </p>
                  )}
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
                    value={getId(form.savingAccount)}
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

                    {savingAccounts.map(
                      (account) => {
                        const id =
                          getId(account);

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
                      className="
                        mt-1.5
                        text-red-600 text-xs
                      "
                    >
                      {errors.savingAccount}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex flex-col-reverse sm:flex-row sm:justify-end
              px-5 sm:px-6 py-4
              bg-slate-50
              border-slate-200 border-t
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="
                inline-flex justify-center items-center
                px-4 py-2.5
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-100
                border border-slate-200 rounded-xl
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
                inline-flex justify-center items-center
                px-5 py-2.5
                font-semibold text-white text-sm
                bg-slate-900 hover:bg-slate-800
                rounded-xl
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