use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, presigning::PresigningConfig, Client};
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct R2Config {
    pub account_id: String,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub bucket_name: String,
    pub public_url: String,
}

impl R2Config {
    pub fn from_env() -> Result<Self, String> {
        // Try to load .env file from multiple locations
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
            .map_err(|_| "R2_ACCOUNT_ID not set in .env file")?;
        let access_key_id = std::env::var("R2_ACCESS_KEY_ID")
            .map_err(|_| "R2_ACCESS_KEY_ID not set in .env file")?;
        let secret_access_key = std::env::var("R2_SECRET_ACCESS_KEY")
            .map_err(|_| "R2_SECRET_ACCESS_KEY not set in .env file")?;
        let bucket_name = std::env::var("R2_BUCKET_NAME")
            .map_err(|_| "R2_BUCKET_NAME not set in .env file")?;
        let public_url = std::env::var("R2_PUBLIC_URL")
            .map_err(|_| "R2_PUBLIC_URL not set in .env file")?;
        
        println!("R2 Config loaded - Account ID: {}, Bucket: {}", account_id, bucket_name);
        
        Ok(R2Config {
            account_id,
            access_key_id,
            secret_access_key,
            bucket_name,
            public_url,
        })
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

