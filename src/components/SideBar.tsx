import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Box,
} from "@suid/material";
import { tags, setTags } from "@src/stores/tags";
import { TagDatabase } from "@src/api/tag-database";
import { open } from "@tauri-apps/plugin-dialog";

const DRAWER_WIDTH = 280;

export default function SideBar() {
  const handleSelectFile = async () => {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "YAML",
          extensions: ["yaml", "yml"],
        },
      ],
    });
    if (!file) {
      return;
    }

    try {
      const tags = await TagDatabase.getTags(file);
      console.info("Read tags", tags);
      setTags(tags);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <List sx={{ flexGrow: 1 }}>
        <ListSubheader>Tags</ListSubheader>
        {tags.map((tag) => (
          <ListItem disablePadding>{tag.name}</ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto" }}>
        <ListItemButton onClick={handleSelectFile}>
          Select Tag Database
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
