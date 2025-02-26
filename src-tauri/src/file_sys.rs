use base64;
use base64::{engine::general_purpose, Engine as _};
use image::{GenericImageView, ImageFormat};
use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::State;

use crate::state;

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

#[tauri::command]
pub fn fs_read_image_base64(
    state: State<Mutex<state::AppState>>,
    filename: String,
    max_width: u32,
    max_height: u32,
) -> Result<String, String> {
    let app_state = state.lock().map_err(|_e| "Failed to lock state")?;
    let dir = Path::new(&app_state.working_dir);
    let full_path = dir.join(filename);

    resize_image_to_base64(&full_path, max_width, max_height)
}

pub fn resize_image_to_base64(
    path: &Path,
    max_width: u32,
    max_height: u32,
) -> Result<String, String> {
    match fs::read(path) {
        Ok(data) => {
            let img = image::load_from_memory(&data).map_err(|e| format!("Error :{}", e))?;

            let (orig_width, orig_height) = img.dimensions();

            let (new_width, new_height) = if orig_width > max_width || orig_height > max_height {
                let ratio = (max_width as f64 / orig_width as f64)
                    .min(max_height as f64 / orig_height as f64);
                (
                    (orig_width as f64 * ratio) as u32,
                    (orig_height as f64 * ratio) as u32,
                )
            } else {
                (orig_width, orig_height)
            };

            let resized = img.resize(new_width, new_height, image::imageops::FilterType::Lanczos3);

            let mut buf = Cursor::new(Vec::new());
            resized
                .write_to(&mut buf, ImageFormat::WebP)
                .map_err(|e| format!("Convert error: {}", e))?;

            let base64 = general_purpose::STANDARD.encode(buf.into_inner());

            Ok(format!("data:image/webp;base64,{}", base64))
        }
        Err(err) => Err(format!("Reading error: {}", err)),
    }
}
