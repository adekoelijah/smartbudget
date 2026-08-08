
import PropTypes from "prop-types";

import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  MailCheck,
  Phone,
  ShieldCheck,
  Target,
  User,
  Wallet,
} from "lucide-react";

/*
============================================================
PROFILE COMPLETION
============================================================

Responsibilities:

- Calculate profile completion
- Display completion percentage
- Display completion checklist
- Notify parent when an action is requested

Business logic remains in the parent.
This component is presentation + interaction only.
============================================================
*/

const ProfileCompletion = ({
  user = null,
  onAction,
  loading = false,
}) => {
  /*
  ============================================================
  COMPLETION ITEMS
  ============================================================
  */

  const completionItems = [
    {
      id: "photo",
      title: "Profile Photo",
      description: "Add a profile picture to personalize your account.",
      completed: Boolean(user?.avatar),
      icon: User,
      action: "Upload Photo",
    },

    {
      id: "personal",
      title: "Personal Information",
      description:
        "Complete your name and regional information.",
      completed: Boolean(
        user?.firstName &&
          user?.lastName &&
          user?.country
      ),
      icon: User,
      action: "Complete Profile",
    },

    {
      id: "email",
      title: "Email Verification",
      description:
        "Verify your email address to secure your account.",
      completed: Boolean(
        user?.emailVerified
      ),
      icon: MailCheck,
      action: "Verify Email",
    },

    {
      id: "phone",
      title: "Phone Verification",
      description:
        "Add and verify your phone number for additional security.",
      completed: Boolean(
        user?.phoneVerified
      ),
      icon: Phone,
      action: "Verify Phone",
    },

    {
      id: "security",
      title: "Security Setup",
      description:
        "Enable two-factor authentication for stronger protection.",
      completed: Boolean(
        user?.twoFactorEnabled
      ),
      icon: ShieldCheck,
      action: "Enable Security",
    },

    {
      id: "budget",
      title: "Create First Budget",
      description:
        "Create your first budget to start managing your finances.",
      completed: Boolean(
        user?.hasBudget
      ),
      icon: Wallet,
      action: "Create Budget",
    },

    {
      id: "goal",
      title: "Financial Goals",
      description:
        "Define savings targets and track your progress.",
      completed: Boolean(
        user?.hasGoals
      ),
      icon: Target,
      action: "Add Goals",
    },
  ];

  /*
  ============================================================
  COMPLETION CALCULATION
  ============================================================
  */

  const completedCount =
    completionItems.filter(
      (item) => item.completed
    ).length;

  const totalCount =
    completionItems.length;

  const percentage =
    totalCount > 0
      ? Math.round(
          (completedCount / totalCount) * 100
        )
      : 0;

  /*
  ============================================================
  ACTION HANDLER
  ============================================================
  */

  const handleAction = (itemId) => {
    if (
      loading ||
      typeof onAction !== "function"
    ) {
      return;
    }

    onAction(itemId);
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <section
      className="
        overflow-hidden
        w-full
        bg-white
        border border-slate-200 rounded-2xl
        shadow-sm
      "
      aria-labelledby="profile-completion-title"
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          p-4 sm:p-5 lg:p-6
          text-white
          bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700
        "
      >
        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            gap-5
          "
        >
          {/* TITLE */}

          <div
            className="
              flex items-start
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-11 sm:w-12 h-11 sm:h-12
                bg-white/15
                border border-white/20 rounded-xl
                shrink-0
              "
            >
              <CircleAlert
                size={23}
                aria-hidden="true"
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                id="profile-completion-title"
                className="
                  font-bold text-white text-lg sm:text-xl
                "
              >
                Complete Your Profile
              </h2>

              <p
                className="
                  max-w-xl
                  mt-1
                  text-blue-100 text-sm leading-relaxed
                "
              >
                Complete these steps to get the
                most out of your SmartBudget account.
              </p>
            </div>
          </div>

          {/* PERCENTAGE */}

          <div
            className="
              flex items-center
              gap-3 sm:shrink-0
            "
          >
            <div
              className="
                flex justify-center items-center
                w-14 sm:w-16 h-14 sm:h-16
                text-blue-700
                bg-white
                rounded-2xl
                shadow-sm
              "
              aria-label={`Profile ${percentage}% complete`}
            >
              <span
                className="
                  font-bold text-base sm:text-lg
                "
              >
                {percentage}%
              </span>
            </div>

            <div
              className="
                sm:hidden
              "
            >
              <p
                className="
                  font-semibold text-white text-sm
                "
              >
                Profile completion
              </p>

              <p
                className="
                  mt-0.5
                  text-blue-100 text-xs
                "
              >
                {completedCount} of {totalCount} completed
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <div
          className="
            mt-5
          "
        >
          <div
            className="
              flex justify-between items-center
              mb-2
              text-xs
            "
          >
            <span
              className="
                text-blue-100
              "
            >
              Profile progress
            </span>

            <span
              className="
                font-medium text-white
              "
            >
              {completedCount}/{totalCount}
            </span>
          </div>

          <div
            className="
              overflow-hidden
              w-full h-2
              bg-white/20
              rounded-full
            "
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Profile completion progress"
          >
            <div
              className="
                h-full
                bg-white
                rounded-full
                transition-all duration-500 ease-out
              "
              style={{
                width: `${percentage}%`,
              }}
            /
            >
          </div>
        </div>
      </div>

      {/* ==================================================
          COMPLETION ITEMS
      ================================================== */}

      <div
        className="
          divide-y divide-slate-100
        "
      >
        {completionItems.map(
          (item) => (
            <CompletionItem
              key={item.id}
              item={item}
              loading={loading}
              onAction={handleAction}
            />
          )
        )}
      </div>

      {/* ==================================================
          COMPLETE STATE
      ================================================== */}

      {percentage === 100 && (
        <div
          className="
            flex items-start
            p-4 sm:p-5
            bg-emerald-50
            border-emerald-100 border-t
            gap-3
          "
        >
          <CheckCircle2
            size={20}
            className="
              mt-0.5
              text-emerald-600
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <div>
            <p
              className="
                font-semibold text-emerald-800 text-sm
              "
            >
              Your profile is complete
            </p>

            <p
              className="
                mt-1
                text-emerald-700 text-xs leading-relaxed
              "
            >
              Great work. Your SmartBudget profile
              has been fully completed.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

/*
============================================================
COMPLETION ITEM
============================================================
*/

function CompletionItem({
  item,
  onAction,
  loading = false,
}) {
  const Icon = item.icon;

  return (
    <div
      className="
        flex flex-col sm:flex-row sm:items-center
        p-4 sm:p-5
        hover:bg-slate-50/70
        transition-colors
        gap-4
      "
    >
      {/* ==================================================
          LEFT CONTENT
      ================================================== */}

      <div
        className="
          flex flex-1 items-start
          min-w-0
          gap-3
        "
      >
        {/* ICON */}

        <div
          className={`
            flex
            justify-center
            items-center
            w-10
            h-10
            rounded-xl
            shrink-0

            ${
              item.completed
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-blue-600"
            }
          `}
        >
          <Icon
            size={19}
            aria-hidden="true"
          />
        </div>

        {/* TEXT */}

        <div
          className="
            flex-1
            min-w-0
          "
        >
          <div
            className="
              flex flex-wrap items-center
              gap-2
            "
          >
            <h3
              className="
                font-semibold text-slate-900 text-sm break-words
              "
            >
              {item.title}
            </h3>

            {item.completed && (
              <span
                className="
                  inline-flex items-center
                  px-2 py-0.5
                  font-medium text-[11px] text-emerald-700 whitespace-nowrap
                  bg-emerald-50
                  rounded-full
                  gap-1
                "
              >
                <CheckCircle2
                  size={12}
                  aria-hidden="true"
                />

                Complete
              </span>
            )}
          </div>

          <p
            className="
              mt-1
              text-slate-500 text-xs sm:text-sm leading-relaxed
            "
          >
            {item.description}
          </p>
        </div>
      </div>

      {/* ==================================================
          ACTION
      ================================================== */}

      {!item.completed && (
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            onAction?.(item.id)
          }
          className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 shadow-sm hover:shadow px-4 py-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 w-full sm:w-auto font-semibold text-white text-xs sm:text-sm transition-all disabled:cursor-not-allowed sm:shrink-0"
          aria-label={`${item.action} - ${item.title}`}
        >
          {loading ? (
            <>
              <span
                className="
                  w-4 h-4
                  border-2 border-white/40 border-t-white rounded-full
                  animate-spin
                "
                aria-hidden="true"
              /
              >

              Processing...
            </>
          ) : (
            <>
              {item.action}

              <ArrowRight
                size={15}
                aria-hidden="true"
              />
            </>
          )}
        </button>
      )}
    </div>
  );
}

/*
============================================================
PROP TYPES
============================================================
*/

ProfileCompletion.propTypes = {
  user: PropTypes.object,

  onAction: PropTypes.func,

  loading: PropTypes.bool,
};

CompletionItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    icon: PropTypes.elementType.isRequired,
    action: PropTypes.string.isRequired,
  }).isRequired,

  onAction: PropTypes.func,

  loading: PropTypes.bool,
};

export default ProfileCompletion;