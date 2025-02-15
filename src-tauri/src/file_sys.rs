use std::fs;
use std::path::Path;

#[derive(serde::Serialize)]
pub struct FsListResult {
    files: Vec<String>,
    folders: Vec<String>,
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
                let filename = ent.file_name().into_string();
                if let Ok(name) = filename {
                    if ent.path().is_file() {
                        files.push(name);
                    } else if ent.path().is_dir() {
                        folders.push(name);
                    }
                }
            }
            Err(e) => return Err(format!("Error reading entry: {}", e)),
        }
    }

    Ok(FsListResult { files, folders })
}
