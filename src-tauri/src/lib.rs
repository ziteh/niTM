use std::{path::PathBuf, sync::Mutex};
use tauri::Manager;

mod exiftool;
mod file_sys;
mod state;
mod tag_database;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn get_app_dir() -> Result<PathBuf, String> {
    let mut dir = dirs::data_local_dir().ok_or("Can't get local dir")?;
    dir.push("niTM"); // App folder
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let state = Mutex::new(state::AppState {
                working_dir: "".to_string(),
                app_dir: get_app_dir().unwrap(),
            });
            app.manage(state);

            let window = app.get_webview_window("main").unwrap();
            let _ = window.set_title(&format!("niTM Ver {}", app.package_info().version));

            // only include this code on debug builds
            #[cfg(debug_assertions)]
            {
                // https://v2.tauri.app/develop/debug/#opening-devtools-programmatically
                window.open_devtools();
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            exiftool::exiftool_set_working_path,
            exiftool::exiftool_get_version,
            exiftool::exiftool_get_xmp_subject,
            exiftool::exiftool_add_xmp_subject,
            exiftool::exiftool_remove_xmp_subject,
            exiftool::exiftool_clear_xmp_subject,
            tag_database::tag_db_get_tags,
            file_sys::fs_list,
            file_sys::fs_read_image_base64,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
