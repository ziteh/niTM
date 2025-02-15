import { invoke } from "@tauri-apps/api/core";

export interface TagNode {
  name: string;
  rule: string;
  children: TagNode[];
}

export class TagDatabase {
  public static async getTags(): Promise<TagNode[]> {
    try {
      const tags: TagNode[] = await invoke("tag_db_get_tags");
      return tags;
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
