import { LoaderIcon } from "./Icons";

export default ({ children, disabled, loading, size, className, ...props }) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`btn relative flex justify-center items-center border-3 border-transparent ${
        ((disabled || loading) && "opacity-25") +
        " " +
        (size === "large" ? "text-xl" : "")
      } ${className}`}
    >
      {loading && (
        <LoaderIcon className="w-5 h-5 absolute animation-spin animation-linear animation-2s" />
      )}
      <span className={loading ? "invisible" : ""}>{children}</span>
    </button>
  );
};
