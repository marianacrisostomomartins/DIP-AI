import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(
    JSON.parse(localStorage.getItem('projects') || '[]')
  );

  const createNewProject = () => {
    const name = prompt('Nome do novo projeto:');
    if (!name) return;
    const newProject = {
      id: Date.now(),
      name,
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
    navigate(`/project/${newProject.id}`);
  };

  return (
    <main className="p-6 ml-52">
      <h1 className="text-2xl font-bold mb-6">Meus Projetos</h1>
      <button
        onClick={createNewProject}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Novo Projeto
      </button>

      <ul className="space-y-2">
        {projects.map((project: any) => (
          <li key={project.id}>
            <Link
              to={`/project/${project.id}`}
              className="text-blue-600 hover:underline"
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
