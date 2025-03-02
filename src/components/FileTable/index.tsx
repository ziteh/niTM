import { createSignal, For, onMount } from "solid-js";
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

const headers = ["Select", "Preview", "File", "Tags", "Action"];

interface Row {
  name: string;
  tags: string[];
  action: string;
}

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

interface Props {
  rows: Row[];
}

export default function FileTable(prop: Props) {
  const [selectedFiles, setSelectedFiles] = createSignal<string[]>([]);
  const [fileInfo, setFileInfo] = createSignal<FileInfo[]>([]);

  const isAllSelected = () =>
    prop.rows.length > 0 && selectedFiles().length === prop.rows.length;

  const toggleSelection = (file: string) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file],
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected()) {
      setSelectedFiles([]); // Deselect all
    } else {
      setSelectedFiles(prop.rows.map((row) => row.name)); // Select all
    }
  };

  const handleClearTags = async (file: string) => {
    await Exiftool.clearXmpSubjects(file);
  };

  onMount(async () => {
    const infos: FileInfo[] = await Promise.all(
      prop.rows.map(async (row) => {
        const tags = await Exiftool.getXmpSubjects(row.name);
        return { name: row.name, tags };
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
                    checked={selectedFiles().includes(info.name)}
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
