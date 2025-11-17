mod r2;
mod storage;

use r2::{create_r2_client, delete_file, generate_presigned_url, R2Config};
use storage::{FileHistory, FileMetadata};

#[tauri::command]
async fn get_presigned_url(filename: String, content_type: String) -> Result<serde_json::Value, String> {
    println!("Getting presigned URL for: {}", filename);
    
    let config = R2Config::from_env()
        .map_err(|e| {
            eprintln!("Error loading R2 config: {}", e);
            format!("Configuration error: {}. Please check your .env file in src-tauri/.env", e)
        })?;
    
    println!("Creating R2 client...");
    let client = create_r2_client(&config).await
        .map_err(|e| {
            eprintln!("Error creating R2 client: {}", e);
            format!("Failed to connect to R2: {}", e)
        })?;
    
    println!("Generating presigned URL...");
    let response = generate_presigned_url(&client, &config, &filename, &content_type).await
        .map_err(|e| {
            eprintln!("Error generating presigned URL: {}", e);
            format!("Failed to generate upload URL: {}", e)
        })?;
    
    println!("Presigned URL generated successfully for: {}", filename);
    
    Ok(serde_json::json!({
        "url": response.url,
        "key": response.key,
        "publicUrl": response.public_url,
    }))
}

#[tauri::command]
async fn save_file_metadata(
    key: String,
    filename: String,
    size: u64,
    content_type: String,
    public_url: String,
) -> Result<(), String> {
    let mut history = FileHistory::load()?;
    
    let metadata = FileMetadata {
        key,
        filename,
        size,
        content_type,
        public_url,
        uploaded_at: chrono::Utc::now().timestamp(),
    };
    
    history.add_file(metadata);
    history.save()?;
    
    Ok(())
}

#[tauri::command]
async fn get_files() -> Result<Vec<FileMetadata>, String> {
    let history = FileHistory::load()?;
    Ok(history.files)
}

#[tauri::command]
async fn delete_file_from_storage(key: String) -> Result<(), String> {
    let config = R2Config::from_env()?;
    let client = create_r2_client(&config).await?;
    
    // Delete from R2
    delete_file(&client, &config, &key).await?;
    
    // Delete from local history
    let mut history = FileHistory::load()?;
    history.remove_file(&key);
    history.save()?;
    
    Ok(())
}

#[tauri::command]
fn copy_to_clipboard(text: String) -> Result<(), String> {
    use arboard::Clipboard;
    
    let mut clipboard = Clipboard::new()
        .map_err(|e| format!("Failed to access clipboard: {}", e))?;
    
    clipboard
        .set_text(text)
        .map_err(|e| format!("Failed to copy to clipboard: {}", e))?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_presigned_url,
            save_file_metadata,
            get_files,
            delete_file_from_storage,
            copy_to_clipboard,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
