import { For } from "solid-js";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@suid/material";
import TagSelect from "./TagSelect";

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
  return (
    <TableContainer component={Paper}>
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
                <TableCell>{row.action}</TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
