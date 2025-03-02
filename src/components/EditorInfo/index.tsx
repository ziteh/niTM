import { Drawer, List, ListItem, ListSubheader } from "@suid/material";

const DRAWER_WIDTH = 240;

export default function EditorInfo() {
  return (
    <Drawer
      variant="permanent"
      anchor="right"
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
        <ListSubheader>Info</ListSubheader>
        <ListItem>Selected File Info</ListItem>
        <ListItem>More Details...</ListItem>
      </List>
    </Drawer>
  );
}
