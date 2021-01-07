import stringToHslColor, { stringToColor } from "../utils/stringToHslColor";

export default React.forwardRef((props, ref) => {
  const { user } = props;
  return (
    <div
      className={`${
        props.size === "small" ? "h-8 w-8" : "h-10 w-10 text-xl"
      } bg-${stringToColor(
        user.username ? user.username : "default"
      )}-darker rounded-full text-white flex items-center justify-center select-none font-medium`}
      ref={ref}
      alt={user.username && user.username}
      src={user.avatar && user.avatar}
      {...props}
      style={{
        ...props.style,
      }}
    >
      {user.username ? user.username.charAt(0).toUpperCase() : ""}
    </div>
  );
});
