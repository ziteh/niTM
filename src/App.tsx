import { ThemeProvider } from "@suid/material/styles";
import theme from "./theme";
import CssBaseline from "@suid/material/CssBaseline";
import "./App.css";
import { createSignal } from "solid-js";
import FileTablePage from "@src/pages/FileTablePage";
import TagDbDialog from "@src/components/TagDbDialog";

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
