import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { ReactNode } from 'react';
import LanguageSelector from './LanguageSelector';

export default function Header({ title, statusIndicator }: { title: string; statusIndicator?: ReactNode }) {
  const navigate = useNavigate();
  const { logout, getCurrentUserEmail } = useAuth();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const userEmail = getCurrentUserEmail();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('modal.deleteConfirm'))) {
      logout();
      navigate('/signup');
    }
  };

  // Fecha o menu ao clicar fora ou pressionar ESC
  useEffect(() => {
    if (!showMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenu(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="bg-white shadow px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-6">
        {statusIndicator && (
          <div className="hidden sm:block">
            {statusIndicator}
          </div>
        )}
        <LanguageSelector />
        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowMenu(v => !v)}
              >
                <span className="hidden sm:inline">{userEmail}</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleLogout}
                  >{t('header.logout')}</button>
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    onClick={handleDeleteAccount}
                  >{t('header.deleteAccount')}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
