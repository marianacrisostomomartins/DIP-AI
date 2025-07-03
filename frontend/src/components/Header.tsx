import { useNavigate } from 'react-router-dom';
// import { FaUserCircle } from 'react-icons/fa';
import { useState } from 'react';

export default function Header({ title }: { title: string }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja deletar sua conta?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('projects');
      navigate('/signup');
    }
  };

  const handleShare = () => {
    const email = window.prompt('Digite o e-mail do usuário para compartilhar o projeto:');
    if (email) {
      // Aqui você pode chamar uma API ou lógica para compartilhar o projeto
      alert(`Projeto compartilhado com ${email}!`);
    }
  };

  return (
    <header className="bg-white shadow px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          onClick={handleShare}
        >
          Compartilhar
        </button>
        {user && (
          <div className="relative">
            <button
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 focus:outline-none"
              onClick={() => setShowMenu(v => !v)}
            >
              {/* Ícone removido temporariamente */}
              <span className="hidden sm:inline">{user.email}</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleLogout}
                >Logout</button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={handleDeleteAccount}
                >Deletar Conta</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
