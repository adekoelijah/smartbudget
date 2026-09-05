/**
 * SavingPlanTimeline.jsx
 *
 * Production-ready, presentational timeline for SmartSave saving plans.
 *
 * Responsibilities:
 * - Display important saving-plan lifecycle dates/events.
 * - Normalize incomplete or malformed plan data safely.
 * - Present the current plan status visually.
 * - Support compact and standard layouts.
 * - Support optional externally supplied events.
 *
 * Non-responsibilities:
 * - No API calls.
 * - No mutations.
 * - No financial calculations.
 * - No business-rule enforcement.
 * - No application-level state.
 */

import {
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Flag,
  PlayCircle,
  Target,
  XCircle,
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

const SIZE_CONFIG = Object.freeze({
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
});

const EVENT_STYLES = Object.freeze({
  created: {
    icon: CircleDot,
    iconClassName: "text-slate-500",
    wrapperClassName:
      "border-slate-200 bg-slate-50",
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

  completed: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    wrapperClassName:
      "border-emerald-200 bg-emerald-50",
  },

  cancelled: {
    icon: XCircle,
    iconClassName: "text-red-600",
    wrapperClassName:
      "border-red-200 bg-red-50",
  },

  target: {
    icon: Flag,
    iconClassName: "text-violet-600",
    wrapperClassName:
      "border-violet-200 bg-violet-50",
  },

  default: {
    icon: CircleDot,
    iconClassName: "text-slate-500",
    wrapperClassName:
      "border-slate-200 bg-slate-50",
  },
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const isValidDate = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(
    date.getTime(),
  );
};

const getFirstValue = (
  object,
  keys,
) => {
  if (!isObject(object)) {
    return null;
  }

  for (const key of keys) {
    const value = object[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
};

const normalizeEventType = (value) => {
  if (
    typeof value !== "string"
  ) {
    return "default";
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "created":
    case "creation":
      return "created";

    case "started":
    case "active":
    case "in_progress":
    case "ongoing":
      return "active";

    case "paused":
    case "pause":
      return "paused";

    case "completed":
    case "complete":
    case "achieved":
      return "completed";

    case "cancelled":
    case "canceled":
    case "cancel":
      return "cancelled";

    case "target":
    case "target_date":
      return "target";

    default:
      return "default";
  }
};

const getEventStyle = (
  type,
) =>
  EVENT_STYLES[
    normalizeEventType(type)
  ] ??
  EVENT_STYLES.default;

const normalizeEvent = (
  event,
  index,
) => {
  if (!isObject(event)) {
    return null;
  }

  const date =
    getFirstValue(event, [
      "date",
      "eventDate",
      "timestamp",
    ]);

  if (!isValidDate(date)) {
    return null;
  }

  const type =
    normalizeEventType(
      event.type,
    );

  const title =
    typeof event.title ===
      "string" &&
    event.title.trim()
      ? event.title.trim()
      : "Saving plan event";

  const description =
    typeof event.description ===
      "string"
      ? event.description.trim()
      : "";

  const id =
    event.id ??
    event._id ??
    `${type}-${new Date(date).getTime()}-${index}`;

  return {
    ...event,
    id: String(id),
    type,
    title,
    description,
    date,
    completed:
      Boolean(event.completed),
    isTarget:
      Boolean(
        event.isTarget,
      ) || type === "target",
  };
};

/* -------------------------------------------------------------------------- */
/* Timeline builder                                                           */
/* -------------------------------------------------------------------------- */

const buildTimelineEvents = (
  plan,
) => {
  if (!isObject(plan)) {
    return [];
  }

  const status =
    getSavingPlanStatus(plan);

  const createdAt =
    getFirstValue(plan, [
      "createdAt",
      "createdDate",
    ]);

  const startedAt =
    getFirstValue(plan, [
      "startedAt",
      "startDate",
    ]);

  const pausedAt =
    getFirstValue(plan, [
      "pausedAt",
      "pauseDate",
    ]);

  const completedAt =
    getFirstValue(plan, [
      "completedAt",
      "completionDate",
    ]);

  const cancelledAt =
    getFirstValue(plan, [
      "cancelledAt",
      "canceledAt",
      "cancellationDate",
    ]);

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
    (
      status === "cancelled" ||
      status === "canceled"
    )
  ) {
    events.push({
      id: "cancelled",
      type: "cancelled",
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
      completed:
        isSavingPlanCompleted(plan),
      isTarget: true,
    });
  }

  return events
    .map(normalizeEvent)
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime(),
    );
};

/* -------------------------------------------------------------------------- */
/* Timeline event                                                             */
/* -------------------------------------------------------------------------- */

const TimelineEvent = memo(
  ({
    event,
    isLast,
    sizeConfig,
  }) => {
    const style =
      getEventStyle(event.type);

    const Icon = style.icon;

    const formattedDate =
      formatSavingPlanDate(
        event.date,
      );

    const isoDate =
      isValidDate(event.date)
        ? new Date(
            event.date,
          ).toISOString()
        : undefined;

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
            "relative z-10 flex shrink-0",
            "items-center justify-center",
            "rounded-full border",
            sizeConfig.iconWrapper,
            style.wrapperClassName,
          ].join(" ")}
        >
          <Icon
            aria-hidden="true"
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
            dateTime={isoDate}
            className={[
              "mt-1 block font-medium",
              "text-slate-500",
              sizeConfig.date,
            ].join(" ")}
          >
            {formattedDate}
          </time>

          {event.description ? (
            <p
              className={[
                "mt-1 leading-relaxed",
                "text-slate-500",
                sizeConfig.description,
              ].join(" ")}
            >
              {event.description}
            </p>
          ) : null}
        </div>
      </li>
    );
  },
);

TimelineEvent.displayName =
  "TimelineEvent";

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

const TimelineEmptyState = memo(
  ({
    message,
  }) => (
    <div
      className="
        px-4 py-5
        text-center
        bg-slate-50
        border border-slate-200 rounded-xl
      "
    >
      <CalendarDays
        aria-hidden="true"
        className="
          w-5 h-5
          mx-auto mb-2
          text-slate-400
        "
        /
      >

      <p
        className="
          text-slate-500 text-xs
        "
      >
        {message}
      </p>
    </div>
  ),
);

TimelineEmptyState.displayName =
  "TimelineEmptyState";

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
    compact
      ? SIZE_CONFIG.sm
      : SIZE_CONFIG[size] ??
        SIZE_CONFIG.md;

  const timelineEvents =
    useMemo(() => {
      if (Array.isArray(events)) {
        return events
          .map(
            normalizeEvent,
          )
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(
                a.date,
              ).getTime() -
              new Date(
                b.date,
              ).getTime(),
          );
      }

      return buildTimelineEvents(
        plan,
      );
    }, [events, plan]);

  const formattedStatus =
    useMemo(() => {
      if (!plan) {
        return "";
      }

      return formatSavingPlanStatus(
        getSavingPlanStatus(plan),
      );
    }, [plan]);

  const containerClassName = [
    "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasTimeline =
    timelineEvents.length > 0;

  const hasInput =
    isObject(plan) ||
    Array.isArray(events);

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
            <div
              className="
                min-w-0
              "
            >
              <h3
                className="
                  flex items-center
                  font-semibold text-slate-900 text-sm
                  gap-2
                "
              >
                <CalendarDays
                  aria-hidden="true"
                  className="
                    w-4 h-4
                    text-slate-400
                  "
                  /
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

      {!hasInput || !hasTimeline ? (
        <TimelineEmptyState
          message={emptyMessage}
        />
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
                key={event.id}
                event={event}
                isLast={
                  index ===
                  timelineEvents.length - 1
                }
                sizeConfig={
                  sizeConfig
                }
              />
            ),
          )}
        </ol>
      )}
    </section>
  );
};

SavingPlanTimeline.displayName =
  "SavingPlanTimeline";

export default memo(
  SavingPlanTimeline,
);