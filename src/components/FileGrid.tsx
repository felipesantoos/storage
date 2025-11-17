import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize, formatDate } from "../lib/utils";
import type { FileMetadata } from "../types";
import CopyButtons from "./CopyButtons";

interface FileGridProps {
  refreshTrigger: number;
}

export default function FileGrid({ refreshTrigger }: FileGridProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ key: string; filename: string } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; filename: string } | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await invoke<FileMetadata[]>("get_files");
      setFiles(result);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  // Handle ESC key to close fullscreen image
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenImage(null);
        setDeleteConfirm(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleDeleteClick = (key: string, filename: string) => {
    console.log("Delete button clicked for:", filename, "key:", key);
    setDeleteConfirm({ key, filename });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { key, filename } = deleteConfirm;
    setDeleteConfirm(null);

    const loadingToast = toast.loading(`Deleting ${filename}...`);
    
    try {
      console.log("Invoking delete_file_from_storage with key:", key);
      await invoke("delete_file_from_storage", { key });
      toast.dismiss(loadingToast);
      toast.success(`${filename} deleted successfully`);
      loadFiles();
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.dismiss(loadingToast);
      
      let errorMessage = "Failed to delete file";
      if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No files uploaded yet</p>
        <p className="text-sm mt-1">Upload your first image above</p>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors cursor-pointer z-10"
            title="Close (ESC)"
          >
            ✕
          </button>
          <div className="relative max-w-full max-h-full bg-white rounded shadow-2xl">
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.filename}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
            {fullscreenImage.filename}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleDeleteCancel}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete File?</h3>
            <p className="text-gray-600 mb-1">
              Are you sure you want to delete <strong>{deleteConfirm.filename}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              This will remove the file from R2 storage and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
      {files.map((file) => (
        <div
          key={file.key}
          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          {file.content_type.startsWith("image/") ? (
            <div 
              className="aspect-[2/1] sm:aspect-video bg-gray-100 relative cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setFullscreenImage({ url: file.public_url, filename: file.filename })}
              title="Click to view fullscreen"
            >
              <img
                src={file.public_url}
                alt={file.filename}
                className="w-full h-full object-cover sm:object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-[2/1] sm:aspect-video bg-gray-100 flex items-center justify-center">
              <p className="text-gray-400 text-xs sm:text-sm">{file.content_type}</p>
            </div>
          )}
          
          <div className="p-1.5 sm:p-4">
            <h3 className="font-medium text-xs sm:text-sm truncate mb-1 sm:mb-2" title={file.filename}>
              {file.filename}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 sm:mb-3">
              <span className="text-xs">{formatFileSize(file.size)}</span>
              <span className="text-xs hidden sm:inline">{formatDate(file.uploaded_at)}</span>
            </div>

            <div className="flex gap-1">
              <CopyButtons publicUrl={file.public_url} filename={file.filename} />
              <button
                onClick={() => handleDeleteClick(file.key, file.filename)}
                className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors cursor-pointer"
                title="Delete file"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </>
  );
}

