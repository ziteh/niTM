import { ThemeProvider } from "@suid/material/styles";
import theme from "./theme";
import CssBaseline from "@suid/material/CssBaseline";
import "./App.css";
import FileTablePage from "./pages/FileTablePage";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <main class="container">
        <FileTablePage />
      </main>
    </ThemeProvider>
  );
}
