import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-48 bg-gray-900 text-white h-screen p-4 fixed">
      <nav className="flex flex-col space-y-4">
        <Link to="/" className="hover:text-blue-400">🏠 Projetos</Link>
        <button className="hover:text-blue-400">💾 Salvar</button>
        <button className="hover:text-blue-400">⬇️ Exportar</button>
      </nav>
    </aside>
  );
}
