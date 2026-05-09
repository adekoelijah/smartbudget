import clsx from "clsx";

const variants = {
  primary: "bg-primary text-white hover:opacity-90",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  accent: "bg-accent text-white hover:opacity-90",
  danger: "bg-danger text-white hover:opacity-90",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  ghost: "text-gray-700 hover:bg-gray-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = "button",
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {/* LEFT ICON */}
      {LeftIcon && !loading && <LeftIcon size={16} />}

      {/* CONTENT / LOADING */}
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}

      {/* RIGHT ICON */}
      {RightIcon && !loading && <RightIcon size={16} />}
    </button>
  );
};

export default Button;