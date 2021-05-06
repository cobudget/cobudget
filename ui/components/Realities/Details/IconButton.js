import styled from "styled-components";

const IconButton = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 0.25rem;
  color: ${({ dark }) => (dark ? "black" : "white")};
  cursor: pointer;
  &:hover,
  &:focus {
    outline: none;
    background-color: ${({ dark }) =>
      dark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)"};
  }
  &:active {
    background-color: ${({ dark }) =>
      dark ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"};
  }
`;

export default IconButton;
