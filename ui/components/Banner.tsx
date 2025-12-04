import { LoaderIcon } from "./Icons";

import ErrorIcon from "@mui/icons-material/ErrorOutline";
import WarningIcon from "@mui/icons-material/WarningOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";

const Banner = ({
  children,
  variant = "success",
  className,
  loading = false,
  title = "",
  disabled,
  ...props
}: {
  variant: string;
  className: string;
  loading?: boolean;
  title: string;
  disabled?: false;
  children?: React.ReactNode;
}) => {
  return (
    <div
      {...props}
      className={`
        font-medium border-t-3 rounded-b px-4 py-3 shadow
        ${
          disabled || loading
            ? "cursor-default text-gray-600 bg-gray-200"
            : variant === "success"
            ? "bg-green-100 border-green-500 text-green-900 "
            : variant === "warning"
            ? "bg-yellow-100 border-yellow-500 text-yellow-900 "
            : variant === "critical"
            ? "bg-red-100 border-red-500 text-red-900 "
            : ""
        } ${className}`}
    >
      <div className={"flex items-center"}>
        <div className="py-1 pr-2">
          {variant === "critical" && <ErrorIcon />}
          {variant === "warning" && <WarningIcon />}
          {variant === "success" && <CheckCircleIcon />}
        </div>
        <div>
          {loading && (
            <LoaderIcon className="w-5 h-5 absolute animation-spin animation-linear animation-2s" />
          )}
          <p className="font-bold">{title}</p>
          <span
            className={loading ? "invisible" : "" + "text-sm flex items-center"}
          >
            {children}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
