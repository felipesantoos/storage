import { useState } from "react";
import { Toaster } from "sonner";
import UploadZone from "./components/UploadZone";
import FileGrid from "./components/FileGrid";
import WindowControls from "./components/WindowControls";
import ConfigModal from "./components/ConfigModal";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleConfigSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" richColors closeButton />
      
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-8 max-w-7xl">
        <header className="mb-3 sm:mb-6">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img 
                src="/logo.png" 
                alt="Storage Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 object-contain"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  Storage
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  Upload images and copy links
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ConfigModal onConfigSaved={handleConfigSaved} />
              <WindowControls />
            </div>
          </div>
        </header>

        <div className="space-y-3 sm:space-y-8">
          <section className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">
              Upload
            </h2>
            <UploadZone onUploadComplete={handleUploadComplete} />
          </section>

          <section className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">
              Files
            </h2>
            <FileGrid refreshTrigger={refreshTrigger} />
          </section>
        </div>

        <footer className="mt-4 sm:mt-12 text-center text-xs sm:text-sm text-gray-500 hidden sm:block">
          <p>Storage App • Cloudflare R2</p>
          <p className="mt-1 text-xs hidden md:block">
            Made with ❤️ using Tauri • Free 10GB
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
