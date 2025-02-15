import { createSignal } from "solid-js";
import { open } from "@tauri-apps/plugin-dialog";
import { FileSys } from "../api/file_sys";
import { Button } from "@suid/material";
import FileTable from "../components/FileTable";

function createData(name: string, tags: string, action: string) {
  return { name, tags, action };
}

export default function FileTablePage() {
  const [rows, setRows] = createSignal<
    { name: string; tags: string; action: string }[]
  >([]);

  const handleSelectDir = async () => {
    const dir = await open({ multiple: false, directory: true });
    if (!dir) {
      return;
    }
    console.log(dir);

    try {
      const files = await FileSys.list(dir);
      setRows(files.map((f) => createData(f, "T", "A")));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button onClick={() => handleSelectDir()}>FS</Button>
      <FileTable rows={rows()} />
    </>
  );
}
