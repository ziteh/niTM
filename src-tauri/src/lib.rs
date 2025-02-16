use std::sync::Mutex;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let state = Mutex::new(state::AppState::default());
            app.manage(state);

            // only include this code on debug builds
            #[cfg(debug_assertions)]
            {
                // https://v2.tauri.app/develop/debug/#opening-devtools-programmatically
                let window = app.get_webview_window("main").unwrap();
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
