import { LoaderIcon } from "./Icons";

export default ({
  children,
  disabled,
  loading,
  size,
  variant = "primary",
  className,
  type = "button",
  color = "blue",
  fullWidth = false,
  href,
  ...props
}) => {
  const classes = `
  font-medium transition-colors duration-100 rounded-md 
  relative flex justify-center items-center 
  focus:outline-none focus:shadow-outline ${
    (size === "large"
      ? "text-xl px-5 py-3"
      : size === "small"
      ? "px-4 py-1"
      : "px-5 py-2") +
    " " +
    (fullWidth ? "w-full" : "") +
    " " +
    (disabled || loading ? "cursor-default" : "") +
    " " +
    (disabled
      ? "text-gray-600 bg-gray-200"
      : variant === "primary"
      ? `text-white bg-${color} hover:bg-${color}-darker`
      : variant === "secondary"
      ? `bg-${color}-100 text-${color}-darker hover:bg-${color}-200`
      : "text-gray-800 hover:bg-gray-200")
  } ${className}`;

  if (href)
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );

  return (
    <button
      {...props}
      disabled={disabled || loading}
      type={type}
      className={classes}
    >
      {loading && (
        <LoaderIcon className="w-5 h-5 absolute animation-spin animation-linear animation-2s" />
      )}
      <span className={loading ? "invisible" : "" + " flex items-center"}>
        {children}
      </span>
    </button>
  );
};
