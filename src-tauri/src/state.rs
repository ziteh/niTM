use std::path::PathBuf;

#[derive(Default)]
pub struct AppState {
    pub working_dir: String,
    pub app_dir: PathBuf,
}
