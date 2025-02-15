use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct TagNode {
    name: String,
    rule: String,
    children: Vec<TagNode>,
}

#[tauri::command]
pub fn tag_db_get_tags() -> Result<Vec<TagNode>, String> {
    let tt1 = TagNode {
        name: String::from("TT1"),
        rule: String::from("N"),
        children: vec![],
    };

    let t1 = TagNode {
        name: String::from("T1"),
        rule: String::from("N"),
        children: vec![tt1],
    };

    Ok(vec![t1])
}
