import { Avatar } from "@material-ui/core";
import stringToHslColor from "../utils/stringToHslColor";

export default React.forwardRef((props, ref) => {
  const { user } = props;
  return (
    <Avatar
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
      {user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}
    </Avatar>
  );
});
