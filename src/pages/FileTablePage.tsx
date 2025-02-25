import { createSignal } from "solid-js";
import { open } from "@tauri-apps/plugin-dialog";
import { FileSys } from "@src/api/file-sys";
import { Button } from "@suid/material";
import FileTable from "@src/components/FileTable";
import { Exiftool } from "@src/api/exiftool";

const createRow = async (name: string) => {
  try {
    const tags = await Exiftool.getXmpSubjects(name);
    return { name, tags: tags.join(","), action: "A" };
  } catch (err) {
    console.warn(err);
    return { name, tags: "", action: "A" };
  }
};

export default function FileTablePage() {
  const [rows, setRows] = createSignal<
    { name: string; tags: string; action: string }[]
  >([]);
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
      const rowData = await Promise.all(files.map((f) => createRow(f)));
      setRows(rowData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button onClick={() => handleSelectDir()}>Select Folder</Button>
      <p>{workingDir()}</p>
      <FileTable rows={rows()} />
    </>
  );
}
