import { Checkbox, CheckboxProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomCheckbox = styled(Checkbox)<CheckboxProps>(() => ({
  transform: "scale(0.8)",
  alignSelf: "start",
  "&:hover": {
    background: "#3D70B211",
  },
  "&:active": {
    background: "#3D70B211",
  },
  "&.Mui-checked": {
    color: "#3D70B2",
  },
}));

export default CustomCheckbox;
