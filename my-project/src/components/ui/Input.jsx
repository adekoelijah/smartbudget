import { forwardRef, useId } from "react";
import clsx from "clsx";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      disabled = false,
      fullWidth = true,
      className,
      inputClassName,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className={clsx("flex flex-col gap-1", fullWidth && "w-full", className)}>
        {/* LABEL */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* INPUT WRAPPER */}
        <div
          className={clsx(
            "flex items-center border rounded-lg px-3 py-2 bg-white transition-all",
            "focus-within:ring-2 focus-within:ring-accent",
            error
              ? "border-danger focus-within:ring-danger"
              : "border-gray-300",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        >
          {/* LEFT ICON */}
          {LeftIcon && (
            <span className="mr-2 text-gray-400">
              <LeftIcon size={18} />
            </span>
          )}

          {/* INPUT FIELD */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={clsx(
              "w-full bg-transparent outline-none text-sm placeholder-gray-400",
              disabled && "cursor-not-allowed",
              inputClassName
            )}
            {...props}
          />

          {/* RIGHT ICON */}
          {RightIcon && (
            <span className="ml-2 text-gray-400">
              <RightIcon size={18} />
            </span>
          )}
        </div>

        {/* HELPER TEXT */}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <p id={errorId} className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;