import { useState, useRef, useEffect } from 'react';
import { Download, FileText, File } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'json') => Promise<void>;
  canvasName: string;
}

export default function ExportModal({ isOpen, onClose, onExport, canvasName }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [exportMessageType, setExportMessageType] = useState<'success' | 'error' | ''>('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: 'pdf' | 'json') => {
    setIsExporting(true);
    setExportMessage('');
    setExportMessageType('');

    try {
      await onExport(format);
      setExportMessage(`${canvasName} exportado como ${format.toUpperCase()} com sucesso!`);
      setExportMessageType('success');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
        setExportMessage('');
        setExportMessageType('');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao exportar:', error);
      const errorMessage = error.message || `Erro ao exportar como ${format.toUpperCase()}. Tente novamente.`;
      setExportMessage(errorMessage);
      setExportMessageType('error');
    } finally {
      setIsExporting(false);
    }
  };

  // Fechar modal ao pressionar ESC ou clicar fora
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-gray-900">
        <div className="flex items-center gap-3 mb-6">
          <Download size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold">Exportar Projeto</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Escolha o formato para exportar <strong>{canvasName}</strong>:
        </p>

        <div className="space-y-4 mb-6">
          {/* Opção PDF */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <FileText size={24} className="text-red-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900">Exportar como PDF</h3>
            </div>
          </button>

          {/* Opção JSON */}
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <File size={24} className="text-green-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900">Exportar como JSON</h3>
            </div>
          </button>
        </div>

        {/* Status da exportação */}
        {isExporting && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Exportando...</span>
            </div>
          </div>
        )}

        {/* Mensagem de resultado */}
        {exportMessage && (
          <div className={`mb-4 text-center px-4 py-3 rounded-lg ${
            exportMessageType === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {exportMessage}
          </div>
        )}

        {/* Botão de fechar */}
        <button
          onClick={onClose}
          disabled={isExporting}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exportando...' : 'Cancelar'}
        </button>
      </div>
    </div>
  );
}
