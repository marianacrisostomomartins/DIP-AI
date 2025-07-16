import { Link, useNavigate } from 'react-router-dom';
import { Pen, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { apiClient, ApiError } from '../services/api';
import { Canvas } from '../types/api';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, getCurrentUserEmail } = useAuth();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar se o usuário ainda está autenticado
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    loadCanvases();
  }, [isAuthenticated, navigate]);

  const loadCanvases = async () => {
    try {
      setLoading(true);
      const data = await apiClient.listCanvases();
      setCanvases(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // O redirecionamento já será feito pelo handleResponse, 
          // mas podemos limpar o estado local
          setError('Sessão expirada');
          return;
        }
        setError(err.message);
      } else {
        setError('Erro ao carregar projetos');
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    const name = prompt('Nome do novo projeto:');
    if (!name) return;
    
    try {
      const newCanvas = await apiClient.createCanvas(name);
      setCanvases(prev => [...prev, newCanvas]);
      navigate(`/project/${newCanvas.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // O redirecionamento já será feito pelo handleResponse
          return;
        }
        alert(err.message);
      } else {
        alert('Erro ao criar projeto');
      }
    }
  };

  const startEditProject = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEditProject = async (id: string) => {
    try {
      await apiClient.editCanvas(id, editName);
      setCanvases(prev => 
        prev.map(canvas => 
          canvas.id === id ? { ...canvas, name: editName } : canvas
        )
      );
      setEditingId(null);
      setEditName('');
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      alert('Erro ao salvar alterações');
    }
  };

  // Função para separar projetos próprios dos compartilhados
  const currentUserEmail = getCurrentUserEmail();
  const myCanvases = canvases.filter(canvas => canvas.owner.email === currentUserEmail);
  const sharedCanvases = canvases.filter(canvas => canvas.owner.email !== currentUserEmail);

  // Componente para renderizar uma seção de projetos
  const renderProjectSection = (sectionCanvases: Canvas[], title: string, showCreateButton = false) => {
    if (sectionCanvases.length === 0) {
      return (
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 text-center sm:text-left">{title}</h2>
            {showCreateButton && (
              <button
                onClick={createNewProject}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto justify-center"
              >
                <span className="text-xl">+</span> Novo Projeto
              </button>
            )}
          </div>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {showCreateButton ? 'Você ainda não criou nenhum projeto.' : 'Nenhum projeto compartilhado encontrado.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 text-center sm:text-left">{title}</h2>
          {showCreateButton && (
            <button
              onClick={createNewProject}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto justify-center"
            >
              <span className="text-xl">+</span> Novo Projeto
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {sectionCanvases.map((canvas) => (
            <div
              key={canvas.id}
              className="relative group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 p-4 sm:p-6 flex flex-col items-start min-h-[180px] sm:min-h-[200px] border border-gray-100 w-full"
            >
              {editingId === canvas.id ? (
                <>
                  <input
                    className="border-2 border-blue-300 focus:border-blue-500 px-3 py-2 rounded-lg w-full mb-3 text-base outline-none transition"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 w-full justify-end">
                    <button
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium shadow"
                      onClick={() => saveEditProject(canvas.id)}
                    >Salvar</button>
                    <button
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium shadow"
                      onClick={() => setEditingId(null)}
                    >Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to={`/project/${canvas.id}`}
                    className="text-lg sm:text-xl font-bold text-blue-700 hover:underline mb-2 transition break-words max-w-full"
                  >
                    {canvas.name}
                  </Link>
                  <div className="text-xs text-gray-400 mb-1 break-words max-w-full">Criado em: {new Date().toLocaleDateString()}</div>
                  <div className="text-xs text-gray-400 mb-2 break-words max-w-full">Proprietário: {canvas.owner.email}</div>
                  {canvas.users && canvas.users.length > 0 && (
                    <div className="text-xs text-gray-500 mb-4 break-words max-w-full">
                      <span className="font-medium">Acesso compartilhado:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {canvas.users
                          .filter(user => user.id !== canvas.owner.id)
                          .map((user, index) => (
                            <span
                              key={user.id}
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                            >
                              {user.email}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 sm:gap-3 absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {/* Só mostra botão de editar se o usuário for o dono */}
                    {canvas.owner.email === currentUserEmail && (
                      <button
                        title="Editar"
                        className="text-blue-500 hover:text-blue-700 font-semibold px-2 py-1 rounded transition flex items-center gap-1"
                        onClick={() => startEditProject(canvas.id, canvas.name)}
                      >
                        <Pen size={16} className="inline-block" />
                        <span className="hidden sm:inline"></span>
                      </button>
                    )}
                    {/* Só mostra botão de deletar se o usuário for o dono */}
                    {canvas.owner.email === currentUserEmail && (
                      <button
                        title="Deletar"
                        className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded transition flex items-center gap-1"
                        onClick={() => deleteProject(canvas.id)}
                      >
                        <Trash size={16} className="inline-block" />
                        <span className="hidden sm:inline"></span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este projeto?')) return;
    
    try {
      await apiClient.deleteCanvas(id);
      setCanvases(prev => prev.filter(canvas => canvas.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // O redirecionamento já será feito pelo handleResponse
          return;
        }
        alert(err.message);
      } else {
        alert('Erro ao deletar projeto');
      }
    }
  };

  return (
    <>
      <Header title="Meus Projetos" />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center py-6 px-2 sm:px-4 md:px-8">
        <div className="w-full max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight text-center">Projetos</h1>
          </div>
          
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando projetos...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={loadCanvases}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {/* Seção Meus Projetos */}
              {renderProjectSection(myCanvases, "Meus Projetos", true)}
              
              {/* Seção Projetos Compartilhados */}
              {renderProjectSection(sharedCanvases, "Projetos Compartilhados")}
            </>
          )}
        </div>
      </main>
    </>
  );
}
