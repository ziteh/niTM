import { createStore } from "solid-js/store";

export const [selectedFiles, setSelectedFiles] = createStore<string[]>([]);
