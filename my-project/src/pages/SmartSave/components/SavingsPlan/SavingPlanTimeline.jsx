/**
 * SavingPlanTimeline.jsx
 *
 * Production-ready timeline for SmartSave saving plans.
 *
 * Responsibilities:
 * - Display important saving-plan lifecycle dates/events.
 * - Safely normalize incomplete plan data.
 * - Present current plan status visually.
 * - Support compact and standard layouts.
 * - Remain completely presentational.
 *
 * This component must remain:
 * - Side-effect free
 * - API independent
 * - State independent
 * - Financial-logic independent
 */

import {
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Flag,
  PlayCircle,
  Target,
} from "lucide-react";
import { memo, useMemo } from "react";

import {
  getSavingPlanStatus,
  getSavingPlanTargetDate,
  isSavingPlanCompleted,
  isSavingPlanPaused,
} from "../../../../utils/smartSave/savingPlanHelpers";

import {
  formatSavingPlanDate,
  formatSavingPlanStatus,
} from "../../../../utils/smartSave/savingPlanFormatters";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const SIZE_CONFIG = {
  sm: {
    iconWrapper: "h-7 w-7",
    icon: "h-3.5 w-3.5",
    line: "left-[13px]",
    title: "text-xs",
    date: "text-[11px]",
    description: "text-[11px]",
    spacing: "pb-4",
  },

  md: {
    iconWrapper: "h-9 w-9",
    icon: "h-4 w-4",
    line: "left-4",
    title: "text-sm",
    date: "text-xs",
    description: "text-xs",
    spacing: "pb-6",
  },

  lg: {
    iconWrapper: "h-10 w-10",
    icon: "h-5 w-5",
    line: "left-[18px]",
    title: "text-sm",
    date: "text-xs",
    description: "text-sm",
    spacing: "pb-7",
  },
};

const EVENT_STYLES = {
  completed: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    wrapperClassName:
      "border-emerald-200 bg-emerald-50",
  },

  active: {
    icon: PlayCircle,
    iconClassName: "text-blue-600",
    wrapperClassName:
      "border-blue-200 bg-blue-50",
  },

  paused: {
    icon: Clock3,
    iconClassName: "text-amber-600",
    wrapperClassName:
      "border-amber-200 bg-amber-50",
  },

  target: {
    icon: Flag,
    iconClassName: "text-violet-600",
    wrapperClassName:
      "border-violet-200 bg-violet-50",
  },

  created: {
    icon: CircleDot,
    iconClassName: "text-slate-500",
    wrapperClassName:
      "border-slate-200 bg-slate-50",
  },

  default: {
    icon: CircleDot,
    iconClassName: "text-slate-500",
    wrapperClassName:
      "border-slate-200 bg-slate-50",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isValidDate = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const getPlanDate = (plan, ...keys) => {
  if (!plan || typeof plan !== "object") {
    return null;
  }

  for (const key of keys) {
    if (
      plan[key] !== null &&
      plan[key] !== undefined &&
      plan[key] !== ""
    ) {
      return plan[key];
    }
  }

  return null;
};

const getEventStyle = (type) =>
  EVENT_STYLES[type] ??
  EVENT_STYLES.default;

/* -------------------------------------------------------------------------- */
/* Event builder                                                              */
/* -------------------------------------------------------------------------- */

const buildTimelineEvents = (plan) => {
  if (!plan || typeof plan !== "object") {
    return [];
  }

  const status = getSavingPlanStatus(plan);

  const createdAt = getPlanDate(
    plan,
    "createdAt",
    "createdDate",
  );

  const startedAt = getPlanDate(
    plan,
    "startedAt",
    "startDate",
  );

  const pausedAt = getPlanDate(
    plan,
    "pausedAt",
    "pauseDate",
  );

  const completedAt = getPlanDate(
    plan,
    "completedAt",
    "completionDate",
  );

  const cancelledAt = getPlanDate(
    plan,
    "cancelledAt",
    "canceledAt",
    "cancellationDate",
  );

  const targetDate =
    getSavingPlanTargetDate(plan);

  const events = [];

  if (isValidDate(createdAt)) {
    events.push({
      id: "created",
      type: "created",
      title: "Plan created",
      description:
        "Your saving plan was created.",
      date: createdAt,
      completed: true,
    });
  }

  if (isValidDate(startedAt)) {
    events.push({
      id: "started",
      type: "active",
      title: "Plan started",
      description:
        "Your saving plan became active.",
      date: startedAt,
      completed:
        !isSavingPlanPaused(plan) &&
        !isSavingPlanCompleted(plan),
    });
  }

  if (
    isValidDate(pausedAt) &&
    isSavingPlanPaused(plan)
  ) {
    events.push({
      id: "paused",
      type: "paused",
      title: "Plan paused",
      description:
        "Saving activity for this plan is currently paused.",
      date: pausedAt,
      completed: false,
    });
  }

  if (
    isValidDate(completedAt) &&
    isSavingPlanCompleted(plan)
  ) {
    events.push({
      id: "completed",
      type: "completed",
      title: "Plan completed",
      description:
        "The saving plan has been completed.",
      date: completedAt,
      completed: true,
    });
  }

  if (
    isValidDate(cancelledAt) &&
    (status === "cancelled" ||
      status === "canceled")
  ) {
    events.push({
      id: "cancelled",
      type: "paused",
      title: "Plan cancelled",
      description:
        "This saving plan has been cancelled.",
      date: cancelledAt,
      completed: false,
    });
  }

  if (isValidDate(targetDate)) {
    events.push({
      id: "target",
      type: "target",
      title: "Target date",
      description:
        "Your target date for completing this saving plan.",
      date: targetDate,
      completed: isSavingPlanCompleted(plan),
      isTarget: true,
    });
  }

  return events;
};

/* -------------------------------------------------------------------------- */
/* Timeline event                                                             */
/* -------------------------------------------------------------------------- */

const TimelineEvent = ({
  event,
  isLast,
  sizeConfig,
  formatDate,
}) => {
  const style = getEventStyle(event.type);
  const Icon = style.icon;

  return (
    <li
      className={[
        "relative flex gap-3",
        !isLast
          ? sizeConfig.spacing
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!isLast ? (
        <span
          aria-hidden="true"
          className={[
            "absolute top-8 bottom-0 w-px",
            "bg-slate-200",
            sizeConfig.line,
          ].join(" ")}
        />
      ) : null}

      <span
        aria-hidden="true"
        className={[
          "relative z-10 flex shrink-0 items-center",
          "justify-center rounded-full border",
          sizeConfig.iconWrapper,
          style.wrapperClassName,
        ].join(" ")}
      >
        <Icon
          className={[
            sizeConfig.icon,
            style.iconClassName,
          ].join(" ")}
        />
      </span>

      <div
        className="
          flex-1
          min-w-0
          pt-0.5
        "
      >
        <div
          className="
            flex flex-wrap items-center
            gap-x-2 gap-y-1
          "
        >
          <h4
            className={[
              "font-semibold text-slate-900",
              sizeConfig.title,
            ].join(" ")}
          >
            {event.title}
          </h4>

          {event.isTarget ? (
            <span
              className="
                inline-flex items-center
                px-1.5 py-0.5
                font-medium text-[10px] text-violet-700
                bg-violet-50
                border border-violet-200 rounded-full
                gap-1
              "
            >
              <Target
                aria-hidden="true"
                className="
                  w-3 h-3
                "
                /
              >
              Target
            </span>
          ) : null}
        </div>

        <time
          dateTime={
            isValidDate(event.date)
              ? new Date(event.date).toISOString()
              : undefined
          }
          className={[
            "mt-1 block font-medium text-slate-500",
            sizeConfig.date,
          ].join(" ")}
        >
          {formatDate(event.date)}
        </time>

        {event.description ? (
          <p
            className={[
              "mt-1 leading-relaxed text-slate-500",
              sizeConfig.description,
            ].join(" ")}
          >
            {event.description}
          </p>
        ) : null}
      </div>
    </li>
  );
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const SavingPlanTimeline = ({
  plan = null,
  events = null,
  size = "md",
  compact = false,
  showHeader = true,
  title = "Plan timeline",
  description = null,
  emptyMessage =
    "No timeline information is available for this plan.",
  className = "",
}) => {
  const sizeConfig =
    SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  const timelineEvents = useMemo(() => {
    if (Array.isArray(events)) {
      return events.filter(
        (event) =>
          event &&
          typeof event === "object" &&
          isValidDate(event.date),
      );
    }

    return buildTimelineEvents(plan);
  }, [events, plan]);

  const formattedStatus = useMemo(() => {
    if (!plan) {
      return "";
    }

    return formatSavingPlanStatus(
      getSavingPlanStatus(plan),
    );
  }, [plan]);

  const formatDate = (value) =>
    formatSavingPlanDate(value);

  const containerClassName = [
    "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!plan && !Array.isArray(events)) {
    return (
      <section
        className={containerClassName}
        aria-label={title}
      >
        {showHeader ? (
          <div
            className="
              mb-4
            "
          >
            <h3
              className="
                font-semibold text-slate-900 text-sm
              "
            >
              {title}
            </h3>
          </div>
        ) : null}

        <div
          className="
            px-4 py-5
            text-center
            bg-slate-50
            border border-slate-200 rounded-xl
          "
        >
          <p
            className="
              text-slate-500 text-xs
            "
          >
            {emptyMessage}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={containerClassName}
      aria-label={title}
    >
      {showHeader ? (
        <header
          className="
            mb-5
          "
        >
          <div
            className="
              flex flex-wrap justify-between items-center
              gap-2
            "
          >
            <div>
              <h3
                className="
                  font-semibold text-slate-900 text-sm
                "
              >
                {title}
              </h3>

              {description ? (
                <p
                  className="
                    mt-1
                    text-slate-500 text-xs leading-relaxed
                  "
                >
                  {description}
                </p>
              ) : null}
            </div>

            {formattedStatus ? (
              <span
                className="
                  px-2 py-1
                  font-medium text-[11px] text-slate-600
                  bg-slate-50
                  border border-slate-200 rounded-full
                "
              >
                {formattedStatus}
              </span>
            ) : null}
          </div>
        </header>
      ) : null}

      {timelineEvents.length === 0 ? (
        <div
          className="
            px-4 py-5
            text-center
            bg-slate-50
            border border-slate-200 rounded-xl
          "
        >
          <p
            className="
              text-slate-500 text-xs
            "
          >
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ol
          className="
            relative
          "
          aria-label="Saving plan events"
        >
          {timelineEvents.map(
            (event, index) => (
              <TimelineEvent
                key={
                  event.id ??
                  `${event.title ?? "event"}-${event.date}`
                }
                event={event}
                isLast={
                  index ===
                  timelineEvents.length - 1
                }
                sizeConfig={
                  compact
                    ? SIZE_CONFIG.sm
                    : sizeConfig
                }
                formatDate={formatDate}
              />
            ),
          )}
        </ol>
      )}
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export default memo(
  SavingPlanTimeline,
);