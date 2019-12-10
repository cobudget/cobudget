import styled from "styled-components";
import stringToHslColor from "../utils/stringToHslColor";
const Circle = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  border-radius: 25px;
  color: white;
  text-transform: uppercase;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
`;

const Avatar = ({ user, onClick }) => {
  if (user.avatar) {
    return (
      <Circle onClick={onClick}>
        <img src={user.avatar} />
      </Circle>
    );
  }
  const bgColor = stringToHslColor(user.email);
  const letter = user.name ? user.name.charAt(0) : user.email.charAt(0); // TODO: handle without name and email?

  return (
    <Circle onClick={onClick} style={{ background: bgColor }}>
      {letter}
    </Circle>
  );
};

export default Avatar;
