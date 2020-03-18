import stringToHslColor from "../utils/stringToHslColor";

export default React.forwardRef((props, ref) => {
  const { user } = props;
  return (
    <div
      className="h-10 w-10 rounded-full text-white text-xl flex items-center justify-center select-none"
      ref={ref}
      alt={user.name && user.name}
      src={user.avatar && user.avatar}
      {...props}
      style={{
        ...props.style,
        backgroundColor: stringToHslColor(user.name ? user.name : user.email),
        fontWeight: 500
      }}
    >
      {user.name
        ? user.name.charAt(0).toUpperCase()
        : user.email.charAt(0).toUpperCase()}
    </div>
  );
});
