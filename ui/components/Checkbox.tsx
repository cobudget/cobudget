import { Checkbox } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const checkBoxStyles = (theme) => ({
  root: {
    scale: 0.8,
    alignSelf: "start",
    "&:hover": {
      background: "#3D70B211",
    },
    "&:active": {
      background: "#3D70B211",
    },
    "&$checked": {
      color: "#3D70B2",
    },
  },
  checked: {},
});

const CustomCheckbox = withStyles(checkBoxStyles)(Checkbox);
export default CustomCheckbox;
