import { createStore } from "solid-js/store";
import { FlatTagNode } from "@src/api/tag-database";

export const [tags, setTags] = createStore<FlatTagNode[]>([]);
