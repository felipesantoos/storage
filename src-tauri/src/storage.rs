use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileMetadata {
    pub key: String,
    pub filename: String,
    pub size: u64,
    pub content_type: String,
    pub public_url: String,
    pub uploaded_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileHistory {
    pub files: Vec<FileMetadata>,
}

impl FileHistory {
    pub fn new() -> Self {
        FileHistory { files: Vec::new() }
    }

    pub fn load() -> Result<Self, String> {
        let path = Self::get_history_path()?;
        
        if !path.exists() {
            return Ok(Self::new());
        }

        let content = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read history file: {}", e))?;
        
        let history: FileHistory = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse history file: {}", e))?;
        
        Ok(history)
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::get_history_path()?;
        
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize history: {}", e))?;
        
        fs::write(&path, content)
            .map_err(|e| format!("Failed to write history file: {}", e))?;
        
        Ok(())
    }

    pub fn add_file(&mut self, metadata: FileMetadata) {
        self.files.insert(0, metadata); // Add to beginning for recent-first order
    }

    pub fn remove_file(&mut self, key: &str) -> bool {
        if let Some(pos) = self.files.iter().position(|f| f.key == key) {
            self.files.remove(pos);
            return true;
        }
        false
    }

    fn get_history_path() -> Result<PathBuf, String> {
        let home = dirs::home_dir()
            .ok_or("Failed to get home directory")?;
        
        Ok(home.join(".storage-app").join("history.json"))
    }
}

