import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSenha) {
      setError('Digite a nova senha.');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) {
      setError('Nenhuma conta encontrada para redefinir a senha.');
      return;
    }
    user.password = novaSenha;
    localStorage.setItem('user', JSON.stringify(user));
    setSuccess('Senha redefinida com sucesso!');
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Recuperar Senha</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        <input
          type="password"
          placeholder="Nova senha"
          className="w-full mb-6 px-3 py-2 border rounded focus:outline-blue-500"
          value={novaSenha}
          onChange={e => setNovaSenha(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Redefinir Senha
        </button>
        <p className="mt-4 text-center text-sm">
          Lembrou da senha?{' '}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Entrar
          </span>
        </p>
      </form>
    </main>
  );
}
