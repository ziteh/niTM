import { createStore } from "solid-js/store";
import { TagNode } from "@src/api/tag-database";

export const [tags, setTags] = createStore<TagNode[]>([]);
