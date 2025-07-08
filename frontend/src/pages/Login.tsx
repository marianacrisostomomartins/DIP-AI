import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, ApiError } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.login({ username: email, password });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Entrar</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-blue-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-2 px-3 py-2 border rounded focus:outline-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className="flex justify-end mb-6">
          <span
            className="text-blue-600 hover:underline text-sm cursor-pointer"
            onClick={() => navigate('/recuperar-senha')}
          >
            Esqueceu a senha?
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded transition ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="mt-4 text-center text-sm">
          Não tem conta?{' '}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            Criar Conta
          </span>
        </p>
      </form>
    </main>
  );
}
