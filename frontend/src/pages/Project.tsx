import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CanvasGrid from '../components/CanvasGrid';

export default function Project() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-48">
        <Header title={`Projeto #${id ?? ''}`} />
        <div className="p-6">
          <CanvasGrid />
        </div>
      </div>
    </div>
  );
}
