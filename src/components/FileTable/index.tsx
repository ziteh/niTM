import { createEffect, createSignal, For, onMount } from "solid-js";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from "@suid/material";
import { Exiftool } from "@src/api/exiftool";
import { FileSys } from "@src/api/file-sys";
import TagChips from "../TagChips";
import { selectedFiles, setSelectedFiles } from "@src/stores/selectedFiles";

const headers = ["Select", "Preview", "File", "Tags", "Action"];

interface FileInfo {
  name: string;
  tags: string[];
}

function ImageCell(prop: { file: string }) {
  const [imageSrc, setImageSrc] = createSignal<string | undefined>(undefined);

  const handleReadImage = async () => {
    try {
      const img = await FileSys.readImage(prop.file);
      setImageSrc(img);
    } catch (err) {
      console.warn(err);
    }
  };

  onMount(() => {
    handleReadImage();
  });

  return (
    <>{imageSrc() && <img src={imageSrc()} alt={prop.file} width={150} />}</>
  );
}

export default function FileTable(prop: { files: string[] }) {
  const [fileInfo, setFileInfo] = createSignal<FileInfo[]>([]);

  const isAllSelected = () =>
    prop.files.length > 0 && selectedFiles.length === prop.files.length;

  const toggleSelection = (file: string) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file],
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected()) {
      setSelectedFiles([]); // Deselect all
    } else {
      setSelectedFiles(prop.files.map((file) => file)); // Select all
    }
  };

  const handleClearTags = async (file: string) => {
    await Exiftool.clearXmpSubjects(file);
  };

  createEffect(async () => {
    const infos: FileInfo[] = await Promise.all(
      prop.files.map(async (file) => {
        const tags = await Exiftool.getXmpSubjects(file);
        const info: FileInfo = { name: file, tags };
        console.log(info);
        return info;
      }),
    );

    setFileInfo(infos);
  });

  return (
    <TableContainer
      component={Paper}
      sx={{ height: "100%", maxHeight: "75vh", overflow: "auto" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox checked={isAllSelected()} onChange={toggleSelectAll} />
            </TableCell>
            <For each={headers.slice(1)}>
              {(header) => <TableCell>{header}</TableCell>}
            </For>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={fileInfo()}>
            {(info) => (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedFiles.includes(info.name)}
                    onChange={() => toggleSelection(info.name)}
                  />
                </TableCell>
                <TableCell>
                  <ImageCell file={info.name} />
                </TableCell>
                <TableCell component="th" scope="row">
                  {info.name}
                </TableCell>
                <TableCell>
                  <TagChips tags={info.tags} />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleClearTags(info.name)}>
                    Clear
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
