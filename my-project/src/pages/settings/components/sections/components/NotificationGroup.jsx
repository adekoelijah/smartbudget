
import PropTypes from "prop-types";

import NotificationSwitch from "./NotificationSwitch";
// import { getNotificationMeta } from "../notificationConfig";
import { getNotificationMeta} from "./notificationConfig"


/*
==================================================
NOTIFICATION GROUP
==================================================
*/

const NotificationGroup = ({
  title,
  description,
  icon,
  section,
  settings = {},
  disabled = false,
  onChange,
}) => {
  /*
  ==================================================
  NORMALIZE SETTINGS
  ==================================================
  */

  const entries = Object.entries(
    settings || {}
  );


  /*
  ==================================================
  RENDER
  ==================================================
  */

  return (
    <section
      className="
        overflow-hidden
        bg-white
        border border-slate-200 rounded-2xl
      "
    >

      {/* =========================================
          HEADER
      ========================================= */}

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
          {icon}
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


          {description && (
            <p
              className="
                mt-1
                text-slate-500 text-sm leading-relaxed
              "
            >
              {description}
            </p>
          )}

        </div>

      </div>


      {/* =========================================
          SETTINGS
      ========================================= */}

      <div>

        {entries.length === 0 ? (
          <div
            className="
              p-6
              text-slate-500 text-sm
            "
          >
            No notification preferences available.
          </div>
        ) : (
          entries.map(
            ([key, value], index) => {

              const meta =
                getNotificationMeta(
                  section,
                  key
                );


              /*
              ========================================
              FALLBACK METADATA
              ========================================
              */

              const label =
                meta?.label ||
                formatNotificationLabel(key);

              const metaDescription =
                meta?.description ||
                "Manage this notification preference.";


              return (
                <NotificationSwitch
                  key={`${section}-${key}`}
                  label={label}
                  description={metaDescription}
                  checked={Boolean(value)}
                  disabled={disabled}

                  divider={
                    index !==
                    entries.length - 1
                  }

                  onChange={() => {
                    if (
                      disabled ||
                      !onChange
                    ) {
                      return;
                    }

                    onChange(
                      section,
                      key,
                      !value
                    );
                  }}
                />
              );
            }
          )
        )}

      </div>

    </section>
  );
};


/*
==================================================
LABEL FORMATTER
==================================================
*/

const formatNotificationLabel = (
  value
) => {
  if (!value) {
    return "Notification";
  }

  return value
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    )
    .trim();
};


/*
==================================================
PROP TYPES
==================================================
*/

NotificationGroup.propTypes = {
  title: PropTypes.string.isRequired,

  description:
    PropTypes.string,

  icon:
    PropTypes.node,

  section:
    PropTypes.string.isRequired,

  settings:
    PropTypes.object,

  disabled:
    PropTypes.bool,

  onChange:
    PropTypes.func.isRequired,
};


export default NotificationGroup;
