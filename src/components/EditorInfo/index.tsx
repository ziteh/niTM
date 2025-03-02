import { Button, Drawer, List, ListItem, ListSubheader } from "@suid/material";
import { selectedFiles } from "@src/stores/selectedFiles";
import { selectedTags, setSelectedTags } from "@src/stores/selectedTags";
import TagSelect from "../TagSelect";
import { createEffect } from "solid-js";
import { Exiftool } from "@src/api/exiftool";

const DRAWER_WIDTH = 240;

export default function EditorInfo() {
  const handleUpdateTags = (newTags: string[]) => {
    setSelectedTags(newTags);
  };

  const handleApplyTagToFile = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    const tags = selectedTags;

    selectedFiles.forEach(async (file) => {
      try {
        await Exiftool.clearXmpSubjects(file);
        if (tags.length > 0) {
          await Exiftool.addXmpSubjects(file, tags);
        }
      } catch (err) {
        console.warn(err);
      }
    });
  };

  createEffect(async () => {
    if (selectedFiles.length === 1) {
      const filename = selectedFiles[0];
      try {
        const oriTags = await Exiftool.getXmpSubjects(filename);
        if (oriTags.length > 0) {
          setSelectedTags(oriTags);
        } else {
          setSelectedTags([]);
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // Files = 0 or n
      setSelectedTags([]);
    }
  });

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
        <ListSubheader>Files</ListSubheader>
        {selectedFiles.length === 0 ? (
          <ListItem>No file selected</ListItem>
        ) : (
          selectedFiles.map((file) => <ListItem>{file}</ListItem>)
        )}

        <ListSubheader>Tags</ListSubheader>
        <TagSelect tags={selectedTags} onChange={handleUpdateTags} />
        <Button variant="outlined" onClick={() => setSelectedTags([])}>
          Clear
        </Button>
        <Button variant="outlined" onClick={handleApplyTagToFile}>
          Apply
        </Button>
      </List>
    </Drawer>
  );
}
