import { LoaderIcon } from "components/Icons";
import { ReactNode, forwardRef } from "react";

function IconButton(
  {
    children,
    className,
    onClick,
    tabIndex,
    loading,
    type = "button",
    disabled
  }: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    tabIndex?: number;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  },
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      className={`rounded-full p-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring ${className}`}
      onClick={onClick}
      tabIndex={tabIndex}
      type={type}
      disabled={disabled || loading}
      ref={ref}
    >
      {loading && (
        <LoaderIcon className="w-6 h-6 absolute animation-spin animation-linear animation-2s" />
      )}
      <span className={loading ? "invisible" : "" + " flex items-center"}>
        {children}
      </span>
    </button>
  );
}

export default forwardRef(IconButton);
