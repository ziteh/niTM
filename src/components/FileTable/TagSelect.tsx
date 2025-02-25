import Box from "@suid/material/Box";
import Chip from "@suid/material/Chip";
import MenuItem from "@suid/material/MenuItem";
import OutlinedInput from "@suid/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@suid/material/Select";
import { Theme, useTheme } from "@suid/material/styles";
import { createSignal, onMount } from "solid-js";
import { tags } from "@src/stores/tags";
import { Exiftool } from "@src/api/exiftool";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      "max-height": `${ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP}px`,
      width: `${250}px`,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    "font-weight":
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

interface Props {
  filename: string;
}

export default function TagSelect(prop: Props) {
  const theme = useTheme();
  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);

  const handleChange = async (event: SelectChangeEvent<string | string[]>) => {
    const {
      target: { value },
    } = event;

    const newTags = Array.isArray(value) ? value : value.split(",");
    setSelectedTags(newTags);

    try {
      await Exiftool.clearXmpSubjects(prop.filename);
      if (newTags.length > 0) {
        await Exiftool.addXmpSubjects(prop.filename, newTags);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  onMount(async () => {
    try {
      const oriTags = await Exiftool.getXmpSubjects(prop.filename);
      if (oriTags.length > 0) {
        setSelectedTags(oriTags);
      }
    } catch (err) {
      console.warn(err);
    }
  });

  return (
    <Select
      multiple
      value={selectedTags()}
      onChange={handleChange}
      input={<OutlinedInput label="Chip" />}
      renderValue={(selected) => (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          {selected.map((value) => (
            <Chip label={value} />
          ))}
        </Box>
      )}
      MenuProps={MenuProps}
    >
      {tags
        .filter((tag) => tag.rule === "Normal")
        .map((tag) => (
          <MenuItem
            value={tag.name}
            style={getStyles(tag.name, selectedTags(), theme)}
          >
            {tag.name}
          </MenuItem>
        ))}
    </Select>
  );
}
