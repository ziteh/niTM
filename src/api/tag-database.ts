import { invoke } from "@tauri-apps/api/core";

export type TagRule = "Normal" | "Collection";

export interface FlatTagNode {
  name: string;
  rule: TagRule;
}

export class TagDatabase {
  public static async getTags(path: string): Promise<FlatTagNode[]> {
    try {
      const tags: FlatTagNode[] = await invoke("tag_db_get_tags", { path });
      return tags;
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
