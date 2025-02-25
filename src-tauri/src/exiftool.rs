use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use tauri::State;

use crate::state;

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
) -> Result<Vec<String>, String> {
    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);

    let output = Command::new("exiftool")
        .arg("-XMP:Subject")
        .arg("-veryShort") // Very short output format
        .arg("-tab") // Output in tab-delimited list format
        // .arg("-separator ';'") // Set separator string for list items
        .arg(dir.join(filename))
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if !output.status.success() {
        let stderr_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "Command failed with status {}: {}",
            output.status, stderr_msg
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
) -> Result<(), String> {
    if tags.is_empty() {
        return Err("Tag list cannot be empty".to_string());
    }

    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);

    let mut command = Command::new("exiftool");

    for tag in tags {
        command.arg(format!("-XMP:Subject+={}", tag));
    }

    let output = command
        .arg("-overwrite_original_in_place")
        .arg(dir.join(filename))
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if !output.status.success() {
        let stderr_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "Command failed with status {}: {}",
            output.status, stderr_msg
        ));
    }

    Ok(())
}

#[tauri::command]
pub fn exiftool_remove_xmp_subject(
    state: State<Mutex<state::AppState>>,
    filename: &str,
    tags: Vec<String>,
) -> Result<(), String> {
    if tags.is_empty() {
        return Err("Tag list cannot be empty".to_string());
    }
    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);

    let mut command = Command::new("exiftool");

    for tag in tags {
        command.arg(format!("-XMP:Subject-={}", tag));
    }

    let output = command
        .arg("-overwrite_original_in_place")
        .arg(dir.join(filename))
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if !output.status.success() {
        let stderr_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "Command failed with status {}: {}",
            output.status, stderr_msg
        ));
    }

    Ok(())
}

#[tauri::command]
pub fn exiftool_clear_xmp_subject(
    state: State<Mutex<state::AppState>>,
    filename: &str,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);
    let full_path = dir.join(filename);

    let output = Command::new("exiftool")
        .arg("-XMP:Subject=")
        .arg("-overwrite_original_in_place")
        .arg(&full_path.as_os_str())
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if !output.status.success() {
        let stderr_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "Command failed with status {}: {} ({:?})",
            output.status,
            stderr_msg,
            &full_path.as_os_str()
        ));
    }

    Ok(())
}
