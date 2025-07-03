import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
// import { FaFolder, FaPen, FaTrash } from 'react-icons/fa6';
import Header from '../components/Header';

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(
    JSON.parse(localStorage.getItem('projects') || '[]')
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const createNewProject = () => {
    const name = prompt('Nome do novo projeto:');
    if (!name) return;
    const newProject = {
      id: Date.now(),
      name,
      createdAt: new Date().toLocaleString(),
      owner: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'Desconhecido',
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
    navigate(`/project/${newProject.id}`);
  };

  const startEditProject = (id: number, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEditProject = (id: number) => {
    const updated = projects.map((p: any) =>
      p.id === id ? { ...p, name: editName } : p
    );
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
    setEditingId(null);
    setEditName('');
  };

  const deleteProject = (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este projeto?')) return;
    const updated = projects.filter((p: any) => p.id !== id);
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
  };

  return (
    <>
      <Header title="Meus Projetos" />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center py-6 px-2 sm:px-4 md:px-8">
        <div className="w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left">Meus Projetos</h1>
            <button
              onClick={createNewProject}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto justify-center"
            >
              <span className="text-xl">+</span> Novo Projeto
            </button>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="relative group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 p-4 sm:p-6 flex flex-col items-start min-h-[160px] sm:min-h-[180px] border border-gray-100 w-full"
              >
                {editingId === project.id ? (
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
                        onClick={() => saveEditProject(project.id)}
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
                      to={`/project/${project.id}`}
                      className="text-lg sm:text-xl font-bold text-blue-700 hover:underline mb-2 transition break-words max-w-full"
                    >
                      {project.name}
                    </Link>
                    <div className="text-xs text-gray-400 mb-1 break-words max-w-full">{project.createdAt || ''}</div>
                    <div className="text-xs text-gray-400 mb-4 break-words max-w-full">Proprietário: {project.owner || 'Desconhecido'}</div>
                    <div className="flex gap-2 sm:gap-3 absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        title="Editar"
                        className="text-blue-500 hover:text-blue-700 font-semibold px-2 py-1 rounded transition"
                        onClick={() => startEditProject(project.id, project.name)}
                      >
                        Editar
                      </button>
                      <button
                        title="Deletar"
                        className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded transition"
                        onClick={() => deleteProject(project.id)}
                      >
                        Deletar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
