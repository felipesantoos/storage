import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { Maximize, Minimize, Square, RectangleHorizontal, Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

type WindowMode = 'full' | 'half' | 'quarter' | 'float';

export default function WindowControls() {
  const appWindow = getCurrentWindow();
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(true);
  const [windowMode, setWindowMode] = useState<WindowMode>('float');

  const setFullScreen = async () => {
    try {
      console.log("Setting fullscreen...");
      await appWindow.setFullscreen(true);
      setWindowMode('full');
      toast.success("Full screen mode");
    } catch (error) {
      console.error("Failed to set fullscreen:", error);
      toast.error("Failed to set fullscreen");
    }
  };

  const setHalfWidth = async () => {
    try {
      console.log("Setting half width...");
      await appWindow.setFullscreen(false);
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
      
      const newSize = new LogicalSize(Math.floor(screenWidth / 2), screenHeight);
      console.log("New size:", newSize);
      
      await appWindow.setSize(newSize);
      await appWindow.center();
      setWindowMode('half');
      toast.success("Half width mode");
    } catch (error) {
      console.error("Failed to set half width:", error);
      toast.error(`Failed: ${error}`);
    }
  };

  const setQuarter = async () => {
    try {
      console.log("Setting quarter size...");
      await appWindow.setFullscreen(false);
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
      
      const newSize = new LogicalSize(
        Math.floor(screenWidth / 2), 
        Math.floor(screenHeight / 2)
      );
      console.log("New size:", newSize);
      
      await appWindow.setSize(newSize);
      await appWindow.center();
      setWindowMode('quarter');
      toast.success("Quarter size mode");
    } catch (error) {
      console.error("Failed to set quarter size:", error);
      toast.error(`Failed: ${error}`);
    }
  };

  const setFloating = async () => {
    try {
      console.log("Setting floating mode...");
      await appWindow.setFullscreen(false);
      
      const newSize = new LogicalSize(400, 400);
      console.log("New size:", newSize);
      
      await appWindow.setSize(newSize);
      await appWindow.setAlwaysOnTop(true);
      setIsAlwaysOnTop(true);
      setWindowMode('float');
      toast.success("Floating mode (always on top)");
    } catch (error) {
      console.error("Failed to set floating:", error);
      toast.error(`Failed: ${error}`);
    }
  };

  const toggleAlwaysOnTop = async () => {
    try {
      const newState = !isAlwaysOnTop;
      console.log(`${newState ? 'Enabling' : 'Disabling'} always on top...`);
      await appWindow.setAlwaysOnTop(newState);
      setIsAlwaysOnTop(newState);
      localStorage.setItem('alwaysOnTop', newState.toString());
      toast.success(newState ? "Always on top enabled" : "Always on top disabled");
    } catch (error) {
      console.error("Failed to toggle always on top:", error);
      toast.error("Failed to toggle always on top");
    }
  };

  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      const savedPref = localStorage.getItem('alwaysOnTop');
      if (savedPref !== null) {
        const pref = savedPref === 'true';
        setIsAlwaysOnTop(pref);
        try {
          await appWindow.setAlwaysOnTop(pref);
        } catch (error) {
          console.error("Failed to apply saved preference:", error);
        }
      }
    };
    loadPreference();
  }, [appWindow]);

  return (
    <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-lg">
      <span className="text-xs text-gray-600 mr-1 hidden sm:inline">Size:</span>
      
      <button
        onClick={setFullScreen}
        className={`flex items-center justify-center p-1.5 text-xs rounded transition-colors cursor-pointer ${
          windowMode === 'full'
            ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300'
            : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
        }`}
        title="Full screen"
      >
        <Maximize className="w-3.5 h-3.5" />
        <span className="ml-1 hidden md:inline">Full</span>
      </button>

      <button
        onClick={setHalfWidth}
        className={`flex items-center justify-center p-1.5 text-xs rounded transition-colors cursor-pointer ${
          windowMode === 'half'
            ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300'
            : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
        }`}
        title="Half width"
      >
        <RectangleHorizontal className="w-3.5 h-3.5" />
        <span className="ml-1 hidden md:inline">Half</span>
      </button>

      <button
        onClick={setQuarter}
        className={`flex items-center justify-center p-1.5 text-xs rounded transition-colors cursor-pointer ${
          windowMode === 'quarter'
            ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300'
            : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
        }`}
        title="Quarter size"
      >
        <Square className="w-3.5 h-3.5" />
        <span className="ml-1 hidden md:inline">1/4</span>
      </button>

      <button
        onClick={setFloating}
        className={`flex items-center justify-center p-1.5 text-xs rounded transition-colors cursor-pointer ${
          windowMode === 'float'
            ? 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300'
            : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
        }`}
        title="Small floating window (always on top)"
      >
        <Minimize className="w-3.5 h-3.5" />
        <span className="ml-1 hidden md:inline">Float</span>
      </button>

      <div className="h-6 w-px bg-gray-300 mx-1"></div>
      
      <button
        onClick={toggleAlwaysOnTop}
        className={`flex items-center justify-center p-1.5 text-xs rounded transition-colors cursor-pointer ${
          isAlwaysOnTop 
            ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        title={isAlwaysOnTop ? "Disable always on top" : "Enable always on top"}
      >
        {isAlwaysOnTop ? (
          <Pin className="w-3.5 h-3.5" />
        ) : (
          <PinOff className="w-3.5 h-3.5" />
        )}
        <span className="ml-1 hidden lg:inline text-xs">
          {isAlwaysOnTop ? 'Pinned' : 'Pin'}
        </span>
      </button>
    </div>
  );
}

