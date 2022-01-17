import { LoaderIcon } from "components/Icons";
import { ReactElement } from "react";

const IconButton = ({
  children,
  className,
  onClick,
  tabIndex,
  loading,
  type = "button",
}: {
  children: Element | ReactElement;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}) => (
  <button
    className={`rounded-full p-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring ${className}`}
    onClick={onClick}
    tabIndex={tabIndex}
    type={type}
    disabled={loading}
  >
    {loading && (
      <LoaderIcon className="w-6 h-6 absolute animation-spin animation-linear animation-2s" />
    )}
    <span className={loading ? "invisible" : "" + " flex items-center"}>
      {children}
    </span>
  </button>
);

export default IconButton;
