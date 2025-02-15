use std::fs;
use std::path::Path;

#[tauri::command]
pub fn fs_list(dir: &str) -> Result<Vec<String>, String> {
    let path = Path::new(dir);

    if !path.exists() {
        return Err(format!("Directory '{}' does not exist", dir));
    }
    if !path.is_dir() {
        return Err(format!("'{}' is not a directory", dir));
    }

    let entries = fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut files = Vec::new();
    for entry in entries {
        match entry {
            Ok(ent) => {
                let filename = ent.file_name().into_string();
                if let Ok(name) = filename {
                    files.push(name);
                }
            }
            Err(e) => return Err(format!("Error reading entry: {}", e)),
        }
    }

    Ok(files)
}
