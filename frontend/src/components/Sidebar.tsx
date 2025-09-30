import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Download, Share2, Award, Briefcase, LineChart } from 'lucide-react';
import { apiClient } from '../services/api';
import ExportModal from './ExportModal';
import { ExportService } from '../services/exportService';
import { CanvasState } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  canvasId?: string;
  canvasState?: CanvasState | null;
  canvasName?: string;
}

export default function Sidebar({ canvasId, canvasState, canvasName }: SidebarProps) {
  const { t } = useLanguage();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareMessageType, setShareMessageType] = useState<'success' | 'error' | ''>('');
  const [isSharing, setIsSharing] = useState(false);
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Detecta se está em um projeto (rota /project/:id)
  const isProjectPage = /^\/project\//.test(location.pathname);

  const handleShare = () => {
    setShowShareModal(true);
    setShareEmail('');
    setShareMessage('');
    setShareMessageType('');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !canvasId) {
      setShareMessage(t('sidebar.validEmail'));
      setShareMessageType('error');
      return;
    }

    if (!validateEmail(shareEmail)) {
      setShareMessage(t('sidebar.pleaseValidEmail'));
      setShareMessageType('error');
      return;
    }

    setIsSharing(true);
    setShareMessage('');
    setShareMessageType('');

    try {
      await apiClient.inviteUser(canvasId, shareEmail);
      setShareMessage(`${t('sidebar.userInvited')} ${shareEmail}!`);
      setShareMessageType('success');
      setShareEmail('');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setShareMessage('');
        setShareMessageType('');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao compartilhar projeto:', error);
      const errorMessage = error.message || t('sidebar.shareError');
      setShareMessage(errorMessage);
      setShareMessageType('error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportSubmit = async (format: 'pdf' | 'json') => {
    if (!canvasState || !canvasName) {
      throw new Error('Dados do canvas não disponíveis para exportação.');
    }

    await ExportService.exportCanvas(canvasState, canvasName, { format });
  };

  const closeShareModal = () => setShowShareModal(false);
  const closeExportModal = () => setShowExportModal(false);

  // Fecha o modal ao pressionar ESC ou clicar fora
  useEffect(() => {
    if (!showShareModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeShareModal();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeShareModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareModal]);

  return (
    <aside className="w-48 bg-gray-900 text-white h-screen p-4 fixed z-40 flex flex-col">
      <div className="flex-1">
        <nav className="flex flex-col">
          <Link to="/" className="flex items-center gap-3 hover:text-blue-400 transition-colors mb-6">
            <Home size={30} />
            <span className="text-xl font-medium">{t('sidebar.backToHome')}</span>
          </Link>

          {/* Glossário */}
          <div className="mt-2 mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase">{t('sidebar.glossary')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={16} />
                <span>{t('sidebar.businessOwner')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award size={16} />
                <span>{t('sidebar.expert')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <LineChart size={16} />
                <span>{t('sidebar.dataScientist')}</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Botões de ação */}
      {isProjectPage && canvasId && (
        <div className="space-y-4">
          <button className="flex items-center gap-3 hover:text-blue-400 transition-colors w-full" onClick={handleExport}>
            <Download size={18} />
            <span>{t('sidebar.export')}</span>
          </button>
          <button className="flex items-center gap-3 hover:text-blue-400 transition-colors w-full" onClick={handleShare}>
            <Share2 size={18} />
            <span>{t('sidebar.share')}</span>
          </button>
        </div>
      )}

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-gray-900">
            <h2 className="text-xl font-bold mb-4">{t('sidebar.shareProject')}</h2>
            <form onSubmit={handleShareSubmit} className="mb-4 space-y-4">
              <input
                type="email"
                placeholder={t('sidebar.userEmail')}
                value={shareEmail}
                onChange={e => setShareEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={isSharing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full disabled:opacity-50"
              >
                {isSharing ? t('sidebar.sharing') : t('sidebar.share')}
              </button>
            </form>
            {shareMessage && (
              <p className={`mb-4 text-center px-3 py-2 rounded ${
                shareMessageType === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {shareMessage}
              </p>
            )}
                        <button
              onClick={closeShareModal}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
            >
              {t('sidebar.close')}
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de Exportação */}
      <ExportModal
        isOpen={showExportModal}
        onClose={closeExportModal}
        onExport={handleExportSubmit}
        canvasName={canvasName || 'Canvas'}
      />
    </aside>
  );
}
