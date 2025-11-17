import { invoke } from "@tauri-apps/api/core";
import { Link, FileText } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonsProps {
  publicUrl: string;
  filename: string;
}

export default function CopyButtons({ publicUrl, filename }: CopyButtonsProps) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await invoke("copy_to_clipboard", { text });
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyDirectLink = () => {
    copyToClipboard(publicUrl, "Direct link");
  };

  const handleCopyMarkdown = () => {
    const markdown = `![${filename}](${publicUrl})`;
    copyToClipboard(markdown, "Markdown");
  };

  return (
    <>
      <button
        onClick={handleCopyDirectLink}
        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
        title="Copy direct link"
      >
        <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden md:inline">Link</span>
      </button>
      <button
        onClick={handleCopyMarkdown}
        className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-green-600 hover:bg-green-50 rounded border border-green-200 transition-colors cursor-pointer"
        title="Copy markdown format"
      >
        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden md:inline">MD</span>
      </button>
    </>
  );
}

