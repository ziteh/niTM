use std::process::Command;

#[tauri::command]
pub fn exiftool_get_version() -> String {
    let output = Command::new("exiftool")
        .arg("-ver")
        .output()
        .expect("Error");

    if !output.status.success() {
        eprintln!("Command failed with status: {}", output.status);
        eprintln!("Stderr: {}", String::from_utf8_lossy(&output.stderr));
    }

    String::from_utf8_lossy(&output.stdout).to_string()
}
