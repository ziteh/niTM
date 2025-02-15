import { invoke } from "@tauri-apps/api/core";

export type TagRule = "Normal" | "Collection";

export interface TagNode {
  name: string;
  rule: TagRule;
  children: TagNode[];
}

export class TagDatabase {
  public static async getTags(path: string): Promise<TagNode[]> {
    try {
      const tags: TagNode[] = await invoke("tag_db_get_tags", { path });
      return tags;
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
