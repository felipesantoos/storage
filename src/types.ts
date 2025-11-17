export interface FileMetadata {
  key: string;
  filename: string;
  size: number;
  content_type: string;
  public_url: string;
  uploaded_at: number;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
  publicUrl: string;
}

export interface R2Config {
  account_id: string;
  access_key_id: string;
  secret_access_key: string;
  bucket_name: string;
  public_url: string;
}

