import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p>Página não encontrada.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Voltar para a Home
        </Link>
      </div>
    </main>
  );
}
