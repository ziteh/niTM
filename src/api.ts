import { invoke } from "@tauri-apps/api/core";

export class Exiftool {
  public static async getVersion(): Promise<string> {
    try {
      const version = await invoke("exiftool_get_version");
      return version as string;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async getXmpSubjects(filename: string): Promise<string[]> {
    try {
      const subjects = await invoke("exiftool_get_xmp_subject", { filename });
      return subjects as string[];
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async setXmpSubjects(filename: string, tags: string[]) {
    try {
      await invoke("exiftool_set_xmp_subject", { filename, tags });
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async removeXmpSubjects(filename: string, tags: string[]) {
    try {
      await invoke("exiftool_remove_xmp_subject", { filename, tags });
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async clearXmpSubjects(filename: string) {
    try {
      await invoke("exiftool_clear_xmp_subject", { filename });
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
