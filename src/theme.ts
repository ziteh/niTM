import { createTheme } from "@suid/material/styles";

// https://suid.io/customization/theme/components
const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

export default theme;
