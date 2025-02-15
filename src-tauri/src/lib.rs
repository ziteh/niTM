use tauri::Manager;

mod exiftool;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                // https://v2.tauri.app/develop/debug/#opening-devtools-programmatically
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            exiftool::exiftool_get_version,
            exiftool::exiftool_get_xmp_subject,
            exiftool::exiftool_set_xmp_subject,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
