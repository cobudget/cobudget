import React from "react";
import { stringToColor } from "../utils/stringToHslColor";

export default React.forwardRef(
  (
    {
      user,
      size,
      style,
      ...props
    }: { user: any; size?: string; style?: object },
    ref: any
  ) => {
    // const { user } = props;
    if (!user) return null;
    return (
      <div
        className={`${
          size === "small" ? "h-8 w-8" : "h-10 w-10 text-xl"
        } bg-${stringToColor(
          user?.username ? user.username : "default"
        )}-dark rounded-full text-white flex items-center justify-center select-none font-medium`}
        ref={ref}
        //src={user?.avatar && user.avatar}
        {...props}
        style={{
          ...style,
        }}
      >
        {user?.username
          ? user.username.charAt(0).toUpperCase()
          : user.email?.charAt(0).toUpperCase() ?? ""}
      </div>
    );
  }
);
