import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { invoke } from "@tauri-apps/api/core";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import type { PresignedUrlResponse } from "../types";

interface UploadZoneProps {
  onUploadComplete: () => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setProgress(10);

      // Get presigned URL from Tauri
      toast.loading(`Preparing ${file.name}...`);
      const response = await invoke<PresignedUrlResponse>("get_presigned_url", {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      });

      setProgress(30);
      toast.dismiss();
      toast.loading(`Uploading ${file.name}...`);

      // Upload to R2 using presigned URL
      const uploadResponse = await fetch(response.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => "Unknown error");
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      setProgress(80);

      // Save metadata
      await invoke("save_file_metadata", {
        key: response.key,
        filename: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        publicUrl: response.publicUrl,
      });

      setProgress(100);
      toast.dismiss();
      toast.success(`${file.name} uploaded successfully!`);
      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss();
      
      let errorMessage = `Failed to upload ${file.name}`;
      if (error instanceof Error) {
        if (error.message.includes("R2_")) {
          errorMessage = "Please configure your R2 credentials in src-tauri/.env";
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [onUploadComplete]);

  // Handle paste event for copying images from web
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if it's an image
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          
          if (blob) {
            const timestamp = Date.now();
            const extension = item.type.split("/")[1] || "png";
            const filename = `pasted-image-${timestamp}.${extension}`;
            const file = new File([blob], filename, { type: item.type });
            
            toast.success("Image pasted! Uploading...");
            await uploadFile(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [uploadFile]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], _fileRejections: any, event: any) => {
      // Check if this is a URL drop from browser
      if (event?.dataTransfer) {
        const url = event.dataTransfer.getData("text/uri-list") || event.dataTransfer.getData("text/plain");
        
        if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
          console.log("Detected URL drop:", url);
          try {
            setIsUploading(true);
            toast.loading("Downloading image from URL...");
            
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error("Failed to download");
            
            const blob = await response.blob();
            const filename = url.split("/").pop()?.split("?")[0] || "image.jpg";
            const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
            
            toast.dismiss();
            console.log("Downloaded file:", file.name, file.size);
            await uploadFile(file);
          } catch (error) {
            console.error("Failed to download image:", error);
            toast.dismiss();
            toast.error("Failed to download image. Try saving it to your computer first, then drag the file.");
            setIsUploading(false);
          }
          return;
        }
      }

      // Handle regular file drops
      console.log("Processing files:", acceptedFiles.length);
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    },
    disabled: isUploading,
    noClick: false,
    noDragEventsBubbling: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 sm:p-12 text-center cursor-pointer transition-colors",
        "hover:border-blue-500 hover:bg-blue-50",
        isDragActive && "border-blue-500 bg-blue-50",
        isUploading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 sm:gap-4">
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 animate-spin" />
            <p className="text-sm sm:text-lg font-medium text-gray-700">Uploading...</p>
            {progress > 0 && (
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            <div>
              <p className="text-sm sm:text-lg font-medium text-gray-700">
                {isDragActive
                  ? "Drop here"
                  : "Drag & drop"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1 sm:mt-2 hidden sm:block">
                💾 Drag • 📋 Paste (Cmd/Ctrl+V) • 🖱️ Click
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

