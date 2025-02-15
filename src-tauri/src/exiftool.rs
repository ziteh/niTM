use std::process::Command;

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
pub fn exiftool_get_xmp_subject(filename: &str) -> Result<Vec<String>, String> {
    let output = Command::new("exiftool")
        .arg("-XMP:Subject")
        .arg("-veryShort") // Very short output format
        .arg("-tab") // Output in tab-delimited list format
        // .arg("-separator ';'") // Set separator string for list items
        .arg(filename)
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

    let subjects: Vec<String> = result
        // .trim_start_matches("Subject:")
        .trim()
        .split(",")
        .map(|s| s.trim().to_string())
        .collect();

    Ok(subjects)
}

#[tauri::command]
pub fn exiftool_set_xmp_subject(filename: &str, tags: Vec<String>) -> Result<(), String> {
    if tags.is_empty() {
        return Err("Tag list cannot be empty".to_string());
    }

    let mut command = Command::new("exiftool");

    for tag in tags {
        command.arg(format!("-XMP:Subject+={}", tag));
    }

    let output = command
        .arg(filename)
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
