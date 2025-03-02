import { createSignal } from "solid-js";
import { open } from "@tauri-apps/plugin-dialog";
import { FileSys } from "@src/api/file-sys";
import { Button } from "@suid/material";
import FileTable from "@src/components/FileTable";
import { Exiftool } from "@src/api/exiftool";

export default function FileTablePage() {
  const [files, setFiles] = createSignal<string[]>([]);
  const [workingDir, setWorkingDir] = createSignal("");

  const handleSelectDir = async () => {
    const dir = await open({ multiple: false, directory: true });
    if (!dir) {
      return;
    }
    setWorkingDir(dir);
    await Exiftool.setWorkingDir(dir);

    try {
      const { files } = await FileSys.list(dir);
      setFiles(files);
      console.log(files);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button onClick={() => handleSelectDir()}>Select Folder</Button>
      <p>{workingDir()}</p>
      <FileTable files={files()} />
    </>
  );
}
