import { invoke } from "@tauri-apps/api/core";

export interface FsListResult {
  files: string[];
  folders: string[];
}

export class FileSys {
  public static async list(dir: string): Promise<FsListResult> {
    try {
      const res: FsListResult = await invoke("fs_list", { dir });
      return res;
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
