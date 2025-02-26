use base64::{engine::general_purpose, Engine as _};
use image::{DynamicImage, GenericImageView, ImageFormat};
use std::fs;
use std::fs::File;
use std::io::BufReader;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::State;

use fast_image_resize as fr;
use webp::Encoder;

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

    resize_image_to_base64(&full_path, max_width, max_height, 80.0)
}

pub fn resize_image_to_base64(
    path: &Path,
    max_width: u32,
    max_height: u32,
    quality: f32,
) -> Result<String, String> {
    let file = File::open(path).map_err(|e| format!("Open file error: {}", e))?;
    let reader = BufReader::new(file);

    let img = image::load(
        reader,
        ImageFormat::from_path(path).unwrap_or(ImageFormat::Jpeg),
    )
    .map_err(|e| format!("Loading image error: {}", e))?;

    let (ori_width, ori_height) = img.dimensions();
    let (new_width, new_height) = if ori_width > max_width || ori_height > max_height {
        let ratio =
            (max_width as f64 / ori_width as f64).min(max_height as f64 / ori_height as f64);
        (
            (ori_width as f64 * ratio) as u32,
            (ori_height as f64 * ratio) as u32,
        )
    } else {
        (ori_width, ori_height)
    };

    let src_image = fr::images::Image::from_vec_u8(
        ori_width,
        ori_height,
        img.to_rgba8().into_raw(),
        fr::PixelType::U8x4,
    )
    .map_err(|e| format!("Convert error: {:?}", e))?;

    let mut dst_image = fr::images::Image::new(new_width, new_height, fr::PixelType::U8x4);

    let mut resizer = fr::Resizer::new();
    resizer
        .resize(&src_image, &mut dst_image, None)
        .map_err(|e| format!("Resize error: {:?}", e))?;

    let resized_img = DynamicImage::ImageRgba8(
        image::RgbaImage::from_raw(new_width, new_height, dst_image.into_vec())
            .ok_or("Resized convert error")?,
    );

    let encoder =
        Encoder::from_image(&resized_img).map_err(|e| format!("WebP encoding error: {}", e))?;
    let webp_data = encoder.encode(quality);

    // Convert to base64
    let base64 = general_purpose::STANDARD.encode(webp_data.to_vec());
    Ok(format!("data:image/webp;base64,{}", base64))
}
