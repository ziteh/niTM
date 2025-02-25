use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use tauri::State;

use crate::state;

const TMP_FILENAME: &str = ".exiftool_tmp.txt";
const ARG_ENCODING: &str = "-charset filename=utf8"; // Specify encoding for special characters
const ARG_OVERWRITE: &str = "-overwrite_original_in_place"; // Overwrite original by copying tmp file

#[tauri::command]
pub fn exiftool_get_version() -> Result<String, String> {
    let output = Command::new("exiftool")
        .arg("-ver")
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if !output.status.success() {
        let stderr_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "Command failed with status {}: {}",
            output.status, stderr_msg
        ));
    }

    String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output as UTF-8: {}", e))
}

#[tauri::command]
pub fn exiftool_set_working_path(
    state: State<Mutex<state::AppState>>,
    new_dir: String,
) -> Result<(), String> {
    let path = PathBuf::from(new_dir);
    if !path.exists() {
        return Err("Provided path does not exist".to_string());
    }
    if !path.is_dir() {
        return Err("Provided path is not a directory".to_string());
    }

    let mut app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    app_state.working_dir = path.display().to_string();
    println!("New working dir: {:?}", app_state.working_dir);
    Ok(())
}

#[tauri::command]
pub fn exiftool_get_xmp_subject(
    state: State<Mutex<state::AppState>>,
    filename: &str,
    arg_from_file: bool,
) -> Result<Vec<String>, String> {
    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);
    let full_path = dir.join(filename);
    let tmp_file_path = dir.join(TMP_FILENAME);

    let mut command = Command::new("exiftool");
    command
        .arg(ARG_ENCODING)
        .arg("-XMP:Subject")
        // .arg("-separator ';'") // Set separator string for list items
        .arg("-veryShort") // Very short output format
        .arg("-tab"); // Output in tab-delimited list format

    if arg_from_file {
        write_to_file(&tmp_file_path, &full_path.to_string_lossy())?;

        command.arg("-@").arg(&tmp_file_path);
    } else {
        command.arg(&full_path.as_os_str());
    }

    let output = command
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if arg_from_file {
        let _ = std::fs::remove_file(&tmp_file_path);
    }

    if !output.status.success() {
        return Err(format!(
            "Command failed: {} ({:?})",
            String::from_utf8_lossy(&output.stderr),
            full_path
        ));
    }

    let result = String::from_utf8(output.stdout)
        .map_err(|e| format!("Failed to parse output as UTF-8: {}", e))?;

    let subjects: Vec<String> = if result.is_empty() {
        Vec::new()
    } else {
        result
            .trim()
            .split(",")
            .map(|s| s.trim().to_string())
            .collect()
    };

    Ok(subjects)
}

#[tauri::command]
pub fn exiftool_add_xmp_subject(
    state: State<Mutex<state::AppState>>,
    filename: &str,
    tags: Vec<String>,
    arg_from_file: bool,
) -> Result<(), String> {
    if tags.is_empty() {
        return Err("Tag list cannot be empty".to_string());
    }

    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);
    let full_path = dir.join(filename);
    let tmp_file_path = dir.join(TMP_FILENAME);

    let mut command = Command::new("exiftool");
    command.arg(ARG_ENCODING).arg(ARG_OVERWRITE);

    if arg_from_file {
        let arg = tags
            .iter()
            .map(|tag| format!("-XMP:Subject+={}", tag))
            .collect::<Vec<String>>()
            .join("\n");

        write_to_file(
            &tmp_file_path,
            &format!("{}\n{}", arg, &full_path.to_string_lossy()),
        )?;

        command.arg("-@").arg(&tmp_file_path);
    } else {
        for tag in tags {
            command.arg(format!("-XMP:Subject+={}", tag));
        }

        command.arg(&full_path.as_os_str());
    }

    let output = command
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if arg_from_file {
        let _ = std::fs::remove_file(&tmp_file_path);
    }

    if !output.status.success() {
        return Err(format!(
            "Command failed: {} ({:?})",
            String::from_utf8_lossy(&output.stderr),
            full_path
        ));
    }

    Ok(())
}

#[tauri::command]
pub fn exiftool_remove_xmp_subject(
    state: State<Mutex<state::AppState>>,
    filename: &str,
    tags: Vec<String>,
    arg_from_file: bool,
) -> Result<(), String> {
    if tags.is_empty() {
        return Err("Tag list cannot be empty".to_string());
    }

    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);
    let full_path = dir.join(filename);
    let tmp_file_path = dir.join(TMP_FILENAME);

    let mut command = Command::new("exiftool");
    command.arg(ARG_ENCODING).arg(ARG_OVERWRITE);

    if arg_from_file {
        let arg = tags
            .iter()
            .map(|tag| format!("-XMP:Subject-={}", tag))
            .collect::<Vec<String>>()
            .join("\n");

        write_to_file(
            &tmp_file_path,
            &format!("{}\n{}", arg, &full_path.to_string_lossy()),
        )?;

        command.arg("-@").arg(&tmp_file_path);
    } else {
        for tag in tags {
            command.arg(format!("-XMP:Subject-={}", tag));
        }
        command.arg(&full_path.as_os_str());
    }

    let output = command
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if arg_from_file {
        let _ = std::fs::remove_file(&tmp_file_path);
    }

    if !output.status.success() {
        return Err(format!(
            "Command failed: {} ({:?})",
            String::from_utf8_lossy(&output.stderr),
            full_path
        ));
    }

    Ok(())
}

#[tauri::command]
pub fn exiftool_clear_xmp_subject(
    state: State<Mutex<state::AppState>>,
    filename: &str,
    arg_from_file: bool,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);
    let full_path = dir.join(filename);
    let tmp_file_path = dir.join(TMP_FILENAME);

    let mut command = Command::new("exiftool");
    command
        .arg(ARG_ENCODING)
        .arg(ARG_OVERWRITE)
        .arg("-XMP:Subject="); // Clear subject

    if arg_from_file {
        write_to_file(&tmp_file_path, &full_path.to_string_lossy())?;

        command.arg("-@").arg(&tmp_file_path);
    } else {
        command.arg(&full_path.as_os_str());
    }

    let output = command
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if arg_from_file {
        let _ = std::fs::remove_file(&tmp_file_path);
    }

    if !output.status.success() {
        return Err(format!(
            "Command failed: {} ({:?})",
            String::from_utf8_lossy(&output.stderr),
            full_path
        ));
    }

    Ok(())
}

fn write_to_file(file_path: &Path, content: &str) -> Result<(), String> {
    File::create(file_path)
        .and_then(|mut file| file.write_all(content.as_bytes()))
        .map_err(|e| format!("Error writing to tmp file: {}", e))
}
