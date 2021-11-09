import { forwardRef } from "react";
import { LoaderIcon } from "./Icons";

const Button = forwardRef(
  (
    {
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
      onClick,
      nextJsLink,
      ...props
    }: {
      children: React.ReactChildren | string;
      disabled?: boolean;
      loading?: boolean;
      size?: string;
      variant?: string;
      className?: string;
      type?: "button" | "submit" | "reset";
      color?: string;
      fullWidth?: boolean;
      href?: string;
      onClick?: () => void;
      nextJsLink?: boolean;
    },
    ref: any
  ) => {
    const classes = `
  font-medium transition-colors transition-opacity duration-100 rounded-md 
  relative flex justify-center items-center 
  focus:outline-none focus:ring ${
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
    (disabled ? "opacity-75" : "hover:") +
    " " +
    (variant === "primary"
      ? `text-white bg-${color} ${!disabled ? `hover:bg-${color}-dark` : ""}`
      : variant === "secondary"
      ? `bg-${color}-100 text-${color}-dark ${
          !disabled ? `hover:bg-${color}-200` : ""
        }`
      : "text-gray-800 hover:bg-gray-200")
  } ${className}`;

    if (href || nextJsLink)
      return (
        <a {...(href && { href })} ref={ref} className={classes}>
          {children}
        </a>
      );

    return (
      <button
        {...props}
        onClick={onClick}
        disabled={disabled || loading}
        type={type}
        className={classes}
        ref={ref}
      >
        {loading && (
          <LoaderIcon className="w-5 h-5 absolute animation-spin animation-linear animation-2s" />
        )}
        <span className={loading ? "invisible" : "" + " flex items-center"}>
          {children}
        </span>
      </button>
    );
  }
);

export default Button;
