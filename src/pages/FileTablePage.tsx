import { createSignal } from "solid-js";
import { open } from "@tauri-apps/plugin-dialog";
import { FileSys } from "../api/file_sys";
import { Button } from "@suid/material";
import FileTable from "../components/FileTable";
import { Exiftool } from "../api/exiftool";

const createRow = async (name: string) => {
  const tags = await Exiftool.getXmpSubjects(name);
  return { name, tags: tags.join(","), action: "A" };
};

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
      const { files } = await FileSys.list(dir);
      const rowData = await Promise.all(
        files.map((f) => createRow(dir + "/" + f)), // TODO: handle path
      );
      setRows(rowData);
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
