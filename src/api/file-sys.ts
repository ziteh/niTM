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

  public static async readImage(path: string): Promise<string> {
    try {
      const base64 = await invoke<string>("fs_read_image_base64", { path });
      return base64;
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
