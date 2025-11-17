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

