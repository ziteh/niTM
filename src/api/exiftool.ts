import { invoke } from "@tauri-apps/api/core";

// Exiftool. Read command-line arguments from file.
// If you encounter encoding problems, setting it to 'true' may solve the problem, but it may slightly slow down the read/write speed.
const argFromFile = true;

export class Exiftool {
  public static async getVersion(): Promise<string> {
    try {
      const version = await invoke("exiftool_get_version");
      return version as string;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async setWorkingDir(newDir: string) {
    try {
      await invoke("exiftool_set_working_path", { newDir });
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async getXmpSubjects(filename: string): Promise<string[]> {
    try {
      const subjects = await invoke("exiftool_get_xmp_subject", {
        filename,
        argFromFile,
      });
      return subjects as string[];
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async addXmpSubjects(filename: string, tags: string[]) {
    try {
      await invoke("exiftool_add_xmp_subject", { filename, tags, argFromFile });
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async removeXmpSubjects(filename: string, tags: string[]) {
    try {
      await invoke("exiftool_remove_xmp_subject", {
        filename,
        tags,
        argFromFile,
      });
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public static async clearXmpSubjects(filename: string) {
    try {
      await invoke("exiftool_clear_xmp_subject", {
        filename,
        argFromFile,
      });
    } catch (err) {
      throw new Error(err as string);
    }
  }
}
