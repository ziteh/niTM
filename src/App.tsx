import { ThemeProvider } from "@suid/material/styles";
import theme from "./theme";
import CssBaseline from "@suid/material/CssBaseline";
import "./App.css";
import FileTablePage from "./pages/FileTablePage";
import TagDbDialog from "./components/TagDbDialog";
import { createSignal } from "solid-js";

export default function App() {
  const [open, setOpen] = createSignal(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <main class="container">
        <TagDbDialog open={open()} onClose={handleClose} />

        <FileTablePage />
      </main>
    </ThemeProvider>
  );
}
