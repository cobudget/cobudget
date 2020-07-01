import { LoaderIcon } from "./Icons";

export default ({
  children,
  disabled,
  loading,
  size,
  variant = "primary",
  className,
  type = "button",
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      type={type}
      className={`
        font-medium transition-colors duration-100 rounded-md 
        relative flex justify-center items-center 
        focus:outline-none focus:shadow-outline ${
          (size === "large" ? "text-xl px-5 py-3" : "px-5 py-2") +
          " " +
          (disabled || loading
            ? "cursor-default text-gray-600 bg-gray-200"
            : variant === "primary"
            ? "text-white bg-green hover:bg-green-darker"
            : "text-gray-800 hover:bg-gray-200")
        } ${className}`}
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
