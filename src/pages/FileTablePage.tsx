import FileTable from "../components/FileTable";

function createData(name: string, tags: string, action: string) {
  return { name, tags, action };
}

const rows = [
  createData("Frozen yoghurt", "T", "A"),
  createData("Ice cream sandwich", "T", "A"),
  createData("Eclair", "T", "A"),
  createData("Cupcake", "T", "A"),
  createData("Gingerbread", "T", "A"),
];

export default function FileTablePage() {
  return <FileTable rows={rows} />;
}
