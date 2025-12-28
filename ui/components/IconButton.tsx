import { LoaderIcon } from "components/Icons";
import { ReactNode, forwardRef, ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

function IconButton(
  {
    children,
    className,
    loading,
    type = "button",
    ...rest
  }: IconButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      className={`rounded-full p-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring ${className}`}
      type={type}
      disabled={loading}
      ref={ref}
      {...rest}
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
