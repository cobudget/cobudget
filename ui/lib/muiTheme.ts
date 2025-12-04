import { createTheme } from "@mui/material/styles";

// Create and export a default MUI theme
// This ensures theme is available even during SSG
const theme = createTheme({
  // Use default theme settings
});

export default theme;
