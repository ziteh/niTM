import { Box, Chip } from "@suid/material";

export default function TagChips(prop: { tags: string[] }) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
        }}
      >
        {prop.tags.map((tag) => (
          <Chip label={tag} />
        ))}
      </Box>
    </>
  );
}
