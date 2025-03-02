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
import TagSelect from "./TagSelect";
import { Exiftool } from "@src/api/exiftool";
import { FileSys } from "@src/api/file-sys";

const headers = ["Select", "Preview", "File", "Tags", "Action"];

interface Row {
  name: string;
  tags: string;
  action: string;
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

  const handleSelectedFiles = () => {
    console.log("Selected files:", selectedFiles());
  };

  const handleUpdateTags = async (filename: string, newTags: string[]) => {
    try {
      await Exiftool.clearXmpSubjects(filename);
      if (newTags.length > 0) {
        await Exiftool.addXmpSubjects(filename, newTags);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ height: "100%", maxHeight: "75vh", overflow: "auto" }}
    >
      {/* <Button variant="contained" sx={{ margin: 1 }} onClick={toggleSelectAll}>
        {isAllSelected() ? "Deselect All" : "Select All"}
      </Button> */}
      <Button
        variant="outlined"
        sx={{ margin: 1 }}
        onClick={handleSelectedFiles}
      >
        Selected Files
      </Button>
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
          <For each={prop.rows}>
            {(row) => (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedFiles().includes(row.name)}
                    onChange={() => toggleSelection(row.name)}
                  />
                </TableCell>
                <TableCell>
                  <ImageCell file={row.name} />
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>
                  <TagSelect
                    filename={row.name}
                    onChange={(newTags) => handleUpdateTags(row.name, newTags)}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleClearTags(row.name)}>
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
