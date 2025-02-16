import { ThemeProvider } from "@suid/material/styles";
import theme from "./theme";
import CssBaseline from "@suid/material/CssBaseline";
import "./App.css";
import FileTablePage from "@src/pages/FileTablePage";
import SideBar from "@src/components/SideBar";
import { Box } from "@suid/material";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box component="main" class="container" sx={{ flexGrow: 1, p: 3 }}>
          <FileTablePage />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
