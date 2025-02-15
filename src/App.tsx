import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import "./App.css";
import { Exiftool } from "./api/exiftool";
import { TagDatabase } from "./api/tag-database";
import { FileSys } from "./api/file_sys";
import { Button } from "@suid/material";
import { ThemeProvider } from "@suid/material/styles";
import CssBaseline from "@suid/material/CssBaseline";
import theme from "./theme";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [ver, setVer] = createSignal("");
  const [name, setName] = createSignal("");

  async function greet() {
    // Exiftool.getXmpSubjects(name()).then((kw) => console.log(kw));
    // TagDatabase.getTags(name()).then((t) => console.log(t));
    FileSys.list(name()).then((fs) => console.log(fs));
  }

  async function exiftool() {
    Exiftool.clearXmpSubjects(name());
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main class="container">
        <h1>Welcome to Tauri + Solid</h1>

        <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>
        <Button variant="contained">Hi</Button>

        <button
          on:click={() => {
            exiftool();
          }}
        >
          ver{ver()}
        </button>

        <form
          class="row"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="submit">Greet</button>
        </form>
        <p>{greetMsg()}</p>
      </main>
    </ThemeProvider>
  );
}

export default App;
