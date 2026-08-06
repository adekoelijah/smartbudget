import PropTypes from "prop-types";

import NotificationSwitch from "./NotificationSwitch";
import { getNotificationMeta } from "./notificationConfig";



/*
=========================================
NOTIFICATION GROUP
=========================================
*/

const NotificationGroup = ({
  title,
  description,
  icon: Icon,
  section,
  settings,
  disabled = false,
  onToggle,
}) => {
  return (
    <section
      className="
        overflow-hidden
        bg-white
        border border-slate-200 rounded-3xl
      "
    >
      {/* HEADER */}

      <div
        className="
          flex items-start
          p-6
          border-slate-200 border-b
          gap-4
        "
      >
        <div
          className="
            flex justify-center items-center
            w-11 h-11
            text-blue-600
            bg-blue-50
            rounded-2xl
            shrink-0
          "
        >
          <Icon size={20} />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <h3
            className="
              font-semibold text-slate-900 text-base
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-slate-500 text-sm leading-relaxed
            "
          >
            {description}
          </p>
        </div>
      </div>

      {/* SETTINGS */}

      <div>
        {Object.entries(settings).map(([key, value], index) => {
          const meta = getNotificationMeta(section, key);

          return (
            <NotificationSwitch
              key={`${section}-${key}`}
              label={meta.label}
              description={meta.description}
              checked={value}
              disabled={disabled}
              divider={
                index !==
                Object.keys(settings).length - 1
              }
              onChange={() =>
                onToggle(section, key)
              }
            />
          );
        })}
      </div>
    </section>
  );
};

NotificationGroup.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  section: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

export default NotificationGroup;