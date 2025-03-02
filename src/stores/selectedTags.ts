import { createStore } from "solid-js/store";

export const [selectedTags, setSelectedTags] = createStore<string[]>([]);
