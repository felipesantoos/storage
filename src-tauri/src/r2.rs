use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, presigning::PresigningConfig, Client};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct R2Config {
    pub account_id: String,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub bucket_name: String,
    pub public_url: String,
}

impl R2Config {
    fn get_config_path() -> Result<PathBuf, String> {
        let home_dir = dirs::home_dir()
            .ok_or("Failed to get home directory")?;
        
        let config_dir = home_dir.join(".storage-app");
        
        // Create config directory if it doesn't exist
        if !config_dir.exists() {
            fs::create_dir_all(&config_dir)
                .map_err(|e| format!("Failed to create config directory: {}", e))?;
        }
        
        Ok(config_dir.join("config.json"))
    }
    
    pub fn load_from_file() -> Result<Self, String> {
        let config_path = Self::get_config_path()?;
        
        if !config_path.exists() {
            return Err("Configuration file not found. Please configure your R2 credentials.".to_string());
        }
        
        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config file: {}", e))?;
        
        let config: R2Config = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config file: {}", e))?;
        
        println!("R2 Config loaded from file - Account ID: {}, Bucket: {}", 
                 config.account_id, config.bucket_name);
        
        Ok(config)
    }
    
    pub fn save_to_file(&self) -> Result<(), String> {
        let config_path = Self::get_config_path()?;
        
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize config: {}", e))?;
        
        fs::write(&config_path, json)
            .map_err(|e| format!("Failed to write config file: {}", e))?;
        
        println!("R2 Config saved to file");
        
        Ok(())
    }
    
    pub fn from_env() -> Result<Self, String> {
        // First, try to load from config file (for production builds)
        if let Ok(config) = Self::load_from_file() {
            return Ok(config);
        }
        
        println!("Config file not found, trying to load from .env file...");
        
        // Try to load .env file from multiple locations (for development)
        if let Ok(current_dir) = std::env::current_dir() {
            let env_path = current_dir.join(".env");
            if env_path.exists() {
                dotenv::from_path(&env_path).ok();
            } else {
                // Try parent directory (when running from src-tauri target)
                let parent_env = current_dir.parent()
                    .and_then(|p| Some(p.join(".env")))
                    .filter(|p| p.exists());
                if let Some(path) = parent_env {
                    dotenv::from_path(&path).ok();
                }
            }
        }
        
        // Fallback to default dotenv behavior
        dotenv::dotenv().ok();
        
        let account_id = std::env::var("R2_ACCOUNT_ID")
            .map_err(|_| "R2_ACCOUNT_ID not set. Please configure your credentials.")?;
        let access_key_id = std::env::var("R2_ACCESS_KEY_ID")
            .map_err(|_| "R2_ACCESS_KEY_ID not set. Please configure your credentials.")?;
        let secret_access_key = std::env::var("R2_SECRET_ACCESS_KEY")
            .map_err(|_| "R2_SECRET_ACCESS_KEY not set. Please configure your credentials.")?;
        let bucket_name = std::env::var("R2_BUCKET_NAME")
            .map_err(|_| "R2_BUCKET_NAME not set. Please configure your credentials.")?;
        let public_url = std::env::var("R2_PUBLIC_URL")
            .map_err(|_| "R2_PUBLIC_URL not set. Please configure your credentials.")?;
        
        let config = R2Config {
            account_id,
            access_key_id,
            secret_access_key,
            bucket_name,
            public_url,
        };
        
        // Save to config file for future use
        config.save_to_file().ok();
        
        println!("R2 Config loaded from .env and saved to config file");
        
        Ok(config)
    }
}

pub async fn create_r2_client(config: &R2Config) -> Result<Client, String> {
    let credentials = Credentials::new(
        &config.access_key_id,
        &config.secret_access_key,
        None,
        None,
        "r2",
    );

    let endpoint = format!("https://{}.r2.cloudflarestorage.com", config.account_id);
    
    let s3_config = aws_sdk_s3::Config::builder()
        .credentials_provider(credentials)
        .region(Region::new("auto"))
        .endpoint_url(endpoint)
        .force_path_style(true)
        .build();

    Ok(Client::from_conf(s3_config))
}

#[derive(Debug, Serialize)]
pub struct PresignedUrlResponse {
    pub url: String,
    pub key: String,
    pub public_url: String,
}

pub async fn generate_presigned_url(
    client: &Client,
    config: &R2Config,
    filename: &str,
    content_type: &str,
) -> Result<PresignedUrlResponse, String> {
    let key = format!("{}-{}", chrono::Utc::now().timestamp(), filename);
    
    let presigning_config = PresigningConfig::builder()
        .expires_in(Duration::from_secs(3600)) // 1 hour
        .build()
        .map_err(|e| format!("Failed to create presigning config: {}", e))?;

    let presigned_request = client
        .put_object()
        .bucket(&config.bucket_name)
        .key(&key)
        .content_type(content_type)
        .presigned(presigning_config)
        .await
        .map_err(|e| format!("Failed to generate presigned URL: {}", e))?;

    let public_url = format!("{}/{}", config.public_url, key);

    Ok(PresignedUrlResponse {
        url: presigned_request.uri().to_string(),
        key,
        public_url,
    })
}

pub async fn delete_file(
    client: &Client,
    config: &R2Config,
    key: &str,
) -> Result<(), String> {
    client
        .delete_object()
        .bucket(&config.bucket_name)
        .key(key)
        .send()
        .await
        .map_err(|e| format!("Failed to delete file: {}", e))?;

    Ok(())
}

