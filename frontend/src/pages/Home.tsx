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
      <main className="p-6 ml-52">
        <h1 className="text-2xl font-bold mb-6">Meus Projetos</h1>
        <button
          onClick={createNewProject}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Novo Projeto
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div
              key={project.id}
              className="flex flex-col items-center bg-white rounded shadow p-4 relative group hover:shadow-lg transition"
            >
              {/* Ícone removido temporariamente */}
              {editingId === project.id ? (
                <>
                  <input
                    className="border px-2 py-1 rounded w-full mb-2"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                      onClick={() => saveEditProject(project.id)}
                    >Salvar</button>
                    <button
                      className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                      onClick={() => setEditingId(null)}
                    >Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to={`/project/${project.id}`}
                    className="text-lg font-semibold text-blue-700 hover:underline mb-1"
                  >
                    {project.name}
                  </Link>
                  <div className="text-xs text-gray-500 mb-2">{project.createdAt || ''}</div>
                  <div className="text-xs text-gray-500 mb-2">Proprietário: {project.owner || 'Desconhecido'}</div>
                  <div className="flex gap-3 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      title="Editar"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => startEditProject(project.id, project.name)}
                    >
                      Editar
                    </button>
                    <button
                      title="Deletar"
                      className="text-red-500 hover:text-red-700"
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
      </main>
    </>
  );
}
