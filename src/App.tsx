import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import "./App.css";
import { Exiftool } from "./api/exiftool";
import { TagDatabase } from "./api/tag-database";
import { FileSys } from "./api/file_sys";
import { Button } from "@suid/material";

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
    <main class="container">
      <h1>Welcome to Tauri + Solid</h1>

      <div class="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
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
  );
}

export default App;
