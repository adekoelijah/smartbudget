import PropTypes from "prop-types";

/*
==================================================
NOTIFICATION SWITCH
==================================================
*/

const NotificationSwitch = ({
  label,
  description,
  checked = false,
  disabled = false,
  divider = true,
  onChange,
}) => {
  const handleToggle = () => {
    if (disabled) return;
    onChange?.();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onChange?.();
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between
        gap-5
        p-5
        transition-colors
        duration-200
        ${divider ? "border-b border-slate-200" : ""}
        ${disabled ? "opacity-60" : ""}
      `}
    >
      {/* CONTENT */}

      <div
        className="
          flex-1
          min-w-0
        "
      >
        <h4
          className="
            font-medium text-slate-900 text-sm
          "
        >
          {label}
        </h4>

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

      {/* SWITCH */}

      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative
          inline-flex
          h-7
          w-12
          shrink-0
          items-center
          rounded-full
          transition-all
          duration-300
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-blue-500
          focus-visible:ring-offset-2

          ${
            checked
              ? "bg-blue-600"
              : "bg-slate-300"
          }

          ${
            disabled
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }
        `}
      >
        <span
          aria-hidden="true"
          className={`
            inline-block
            h-5
            w-5
            rounded-full
            bg-white
            shadow-md
            transition-transform
            duration-300

            ${
              checked
                ? "translate-x-6"
                : "translate-x-1"
            }
          `}
        />
      </button>
    </div>
  );
};

NotificationSwitch.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  divider: PropTypes.bool,
  onChange: PropTypes.func,
};

export default NotificationSwitch;