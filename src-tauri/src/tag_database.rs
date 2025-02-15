use serde::{Deserialize, Serialize};
use serde_yaml;
use std::fs;

#[derive(Debug, Deserialize, Serialize)]
pub enum TagRule {
    Normal,
    Collection,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TagNode {
    name: String,
    rule: TagRule,
    children: Vec<TagNode>,
}

fn load_tags_from_yaml(path: &str) -> Result<Vec<TagNode>, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_yaml::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn tag_db_get_tags(path: &str) -> Result<Vec<TagNode>, String> {
    load_tags_from_yaml(path)
}
