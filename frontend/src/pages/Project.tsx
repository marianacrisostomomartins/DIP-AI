import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CanvasGrid from '../components/CanvasGrid';

export default function Project() {
  const { id } = useParams<{ id: string }>();
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (id) {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => String(p.id) === String(id));
      setProjectName(project ? project.name : `Projeto #${id}`);
    }
  }, [id]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-48">
        <Header title={projectName} />
        <div className="p-6">
          <CanvasGrid />
        </div>
      </div>
    </div>
  );
}
