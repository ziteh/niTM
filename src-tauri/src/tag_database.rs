use serde::{Deserialize, Serialize};
use serde_yaml;
use std::fs;

#[derive(Debug, Deserialize, Serialize, Clone)]
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

#[derive(Debug, Deserialize, Serialize)]
pub struct FlatTagNode {
    name: String,
    rule: TagRule,
}

fn load_tags_from_yaml(path: &str) -> Result<Vec<TagNode>, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_yaml::from_str(&content).map_err(|e| e.to_string())
}

fn flatten_tags(nodes: &[TagNode], parent_name: Option<&str>, output: &mut Vec<FlatTagNode>) {
    for node in nodes {
        let full_name = match parent_name {
            Some(parent) => format!("{}/{}", parent, node.name),
            None => node.name.clone(),
        };

        output.push(FlatTagNode {
            name: full_name.clone(),
            rule: node.rule.clone(),
        });

        flatten_tags(&node.children, Some(&full_name), output);
    }
}

fn convert_tags(tag_nodes: Vec<TagNode>) -> Vec<FlatTagNode> {
    let mut flat_tags = Vec::new();
    flatten_tags(&tag_nodes, None, &mut flat_tags);
    flat_tags
}

#[tauri::command]
pub fn tag_db_get_tags(path: &str) -> Result<Vec<FlatTagNode>, String> {
    let tags = load_tags_from_yaml(path)?;
    Ok(convert_tags(tags))
}
