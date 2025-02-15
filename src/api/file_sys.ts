import { invoke } from "@tauri-apps/api/core";

export class FileSys {
  public static async list(dir: string): Promise<string[]> {
    try {
      const files: string[] = await invoke("fs_list", { dir });
      return files;
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
