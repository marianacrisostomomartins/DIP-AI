import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Save, Download, Share2 } from 'lucide-react';

export default function Sidebar() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Detecta se está em um projeto (rota /project/:id)
  const isProjectPage = /^\/project\//.test(location.pathname);

  const handleShare = () => {
    setShowShareModal(true);
    setShareEmail('');
    setShareMessage('');
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareEmail) {
      setShareMessage(`Projeto compartilhado com ${shareEmail}`);
    } else {
      setShareMessage('Digite um e-mail válido.');
    }
  };

  const closeShareModal = () => setShowShareModal(false);

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
    <aside className="w-48 bg-gray-900 text-white h-screen p-4 fixed z-40">
      <nav className="flex flex-col space-y-4">
        <Link to="/" className="flex items-center gap-3 hover:text-blue-400 transition-colors mb-6">
          <Home size={30} />
          <span className="text-xl font-medium">Projetos</span>
        </Link>
        {isProjectPage && (
          <>
          <button className="flex items-center gap-3 hover:text-blue-400 transition-colors" onClick={handleShare}>
              <Share2 size={18} />
              <span>Compartilhar</span>
            </button>
            <button className="flex items-center gap-3 hover:text-blue-400 transition-colors">
              <Download size={18} />
              <span>Exportar</span>
            </button>
          </>
        )}
      </nav>
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-gray-900">
            <h2 className="text-xl font-bold mb-4">Compartilhar Projeto</h2>
            <form onSubmit={handleShareSubmit} className="mb-4 space-y-4">
              <input
                type="email"
                placeholder="E-mail do usuário"
                value={shareEmail}
                onChange={e => setShareEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              >
                Compartilhar
              </button>
            </form>
            {shareMessage && <p className="mb-4 text-center">{shareMessage}</p>}
            <button
              onClick={closeShareModal}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
