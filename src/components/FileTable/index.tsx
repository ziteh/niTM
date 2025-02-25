import { For } from "solid-js";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@suid/material";
import TagSelect from "./TagSelect";
import { Exiftool } from "@src/api/exiftool";

const headers = ["File", "Tags", "Action"];

interface Row {
  name: string;
  tags: string;
  action: string;
}

interface Props {
  rows: Row[];
}

export default function FileTable(prop: Props) {
  const handleClearTags = async (file: string) => {
    await Exiftool.clearXmpSubjects(file);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ height: "100%", maxHeight: "75vh", overflow: "auto" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <For each={headers}>
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
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>
                  <TagSelect filename={row.name} />
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
