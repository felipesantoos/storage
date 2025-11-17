import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Settings, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { R2Config } from "../types";

interface ConfigModalProps {
  onConfigSaved: () => void;
}

export default function ConfigModal({ onConfigSaved }: ConfigModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState<R2Config>({
    account_id: "",
    access_key_id: "",
    secret_access_key: "",
    bucket_name: "",
    public_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkConfig();
  }, []);

  // Block background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const checkConfig = async () => {
    try {
      const hasConfig = await invoke<boolean>("check_config");
      setIsConfigured(hasConfig);
      
      if (hasConfig) {
        const existingConfig = await invoke<R2Config>("get_config");
        setConfig(existingConfig);
      }
    } catch (error) {
      console.error("Error checking config:", error);
      setIsConfigured(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate fields
      if (!config.account_id || !config.access_key_id || !config.secret_access_key || 
          !config.bucket_name || !config.public_url) {
        toast.error("Todos os campos são obrigatórios");
        return;
      }

      await invoke("save_config", {
        accountId: config.account_id,
        accessKeyId: config.access_key_id,
        secretAccessKey: config.secret_access_key,
        bucketName: config.bucket_name,
        publicUrl: config.public_url,
      });

      toast.success("Configurações salvas com sucesso!");
      setIsConfigured(true);
      setIsOpen(false);
      onConfigSaved();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error(`Erro ao salvar configurações: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
          isConfigured
            ? "bg-green-50 text-green-600 hover:bg-green-100"
            : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
        }`}
        title={isConfigured ? "Configurado" : "Configuração necessária"}
      >
        {isConfigured ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Settings className="w-4 h-4 animate-pulse" />
        )}
        <span className="text-sm font-medium hidden sm:inline">
          {isConfigured ? "Configurado" : "Configurar"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[95vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between rounded-t-lg sm:rounded-t-xl">
              <div className="flex items-center gap-2 min-w-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                  Configurações R2
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              {/* Help Section - Collapsible on small screens */}
              <details className="bg-blue-50 border border-blue-200 rounded-lg">
                <summary className="cursor-pointer p-2 sm:p-3 font-semibold text-xs sm:text-sm text-blue-900 hover:bg-blue-100 rounded-lg transition-colors">
                  💡 Como obter credenciais
                </summary>
                <ol className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1 list-decimal list-inside px-3 pb-2 sm:pb-3 pt-1">
                  <li>Acesse o Dashboard do Cloudflare</li>
                  <li>Vá em R2 Object Storage</li>
                  <li>Crie um bucket</li>
                  <li>Ative o acesso público</li>
                  <li>Crie um API Token</li>
                  <li>Copie as credenciais aqui</li>
                </ol>
              </details>

              {/* Form Fields */}
              <div className="space-y-2.5 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Account ID
                  </label>
                  <input
                    type="text"
                    value={config.account_id}
                    onChange={(e) =>
                      setConfig({ ...config, account_id: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="a1b2c3d4..."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Access Key ID
                  </label>
                  <input
                    type="text"
                    value={config.access_key_id}
                    onChange={(e) =>
                      setConfig({ ...config, access_key_id: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="1234567890abcdef..."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Secret Access Key
                  </label>
                  <input
                    type="password"
                    value={config.secret_access_key}
                    onChange={(e) =>
                      setConfig({ ...config, secret_access_key: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Bucket Name
                  </label>
                  <input
                    type="text"
                    value={config.bucket_name}
                    onChange={(e) =>
                      setConfig({ ...config, bucket_name: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="storage-uploads"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Public URL
                  </label>
                  <input
                    type="text"
                    value={config.public_url}
                    onChange={(e) =>
                      setConfig({ ...config, public_url: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="https://pub-xxx.r2.dev"
                  />
                </div>
              </div>

              {/* Info Footer */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-lg">
                <p className="font-semibold mb-1">🔒 Salvo em:</p>
                <code className="text-[10px] sm:text-xs bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded block break-all">
                  ~/.storage-app/config.json
                </code>
              </div>
            </div>

            {/* Footer Buttons - Fixed */}
            <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 bg-gray-50 rounded-b-lg sm:rounded-b-xl">
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

