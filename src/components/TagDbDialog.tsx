import { Button, Dialog, DialogContent, DialogTitle } from "@suid/material";
import { open } from "@tauri-apps/plugin-dialog";
import { setTags } from "@src/stores/tags";
import { TagDatabase } from "@src/api/tag-database";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TagDbDialog(prop: Props) {
  const handleSelectFile = async () => {
    const file = await open({ multiple: false, directory: false });
    if (!file) {
      return;
    }

    const tags = await TagDatabase.getTags(file);
    console.info("Read tags", tags);
    setTags(tags);
    prop.onClose();
  };

  return (
    <Dialog open={prop.open}>
      <DialogTitle>Select Tag Database</DialogTitle>
      <DialogContent>
        <Button onClick={handleSelectFile}>Open</Button>
      </DialogContent>
    </Dialog>
  );
}
