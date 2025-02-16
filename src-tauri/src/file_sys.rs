use std::fs;
use std::path::{Path, PathBuf};

#[derive(serde::Serialize)]
pub struct FsListResult {
    files: Vec<String>,
    folders: Vec<String>,
}

fn is_supported_file(filename: &Path) -> bool {
    // Exiftool XMP
    if let Some(ext) = filename.extension().and_then(|s| s.to_str()) {
        matches!(
            ext.to_lowercase().as_str(),
            "jpeg"
                | "jpg"
                | "tiff"
                | "png"
                | "webp"
                | "raw"
                | "mp4"
                | "mov"
                | "avi"
                | "mkv"
                | "xmp"
        )
    } else {
        false
    }
}

#[tauri::command]
pub fn fs_list(dir: &str) -> Result<FsListResult, String> {
    let path = Path::new(dir);

    if !path.exists() {
        return Err(format!("Directory '{}' does not exist", dir));
    }
    if !path.is_dir() {
        return Err(format!("'{}' is not a directory", dir));
    }

    let entries = fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut files = Vec::new();
    let mut folders = Vec::new();

    for entry in entries {
        match entry {
            Ok(ent) => {
                let path_buf: PathBuf = ent.path();
                let filename = ent.file_name().into_string();
                if let Ok(name) = filename {
                    if path_buf.is_file() && is_supported_file(&path_buf) {
                        files.push(name);
                    } else if path_buf.is_dir() {
                        folders.push(name);
                    }
                }
            }
            Err(e) => return Err(format!("Error reading entry: {}", e)),
        }
    }

    Ok(FsListResult { files, folders })
}
