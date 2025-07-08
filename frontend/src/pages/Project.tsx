import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CanvasGrid from '../components/CanvasGrid';
import ProcessingIndicator from '../components/ProcessingIndicator';
import { useCanvas } from '../hooks/useCanvas';
import { useAuth } from '../hooks/useAuth';

export default function Project() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { canvasState, canvasName, loading, error, updateField, refreshCanvas, processingFields } = useCanvas(id || '');

  useEffect(() => {
    // Verificar se o usuário ainda está autenticado
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, navigate]);

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Canvas ID não encontrado</h1>
          <p className="text-gray-600 mb-6">Não foi possível identificar o projeto que você está tentando acessar.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voltar à página inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-48">
        <Header 
          title={canvasName || `Canvas #${id}`} 
          statusIndicator={<ProcessingIndicator processingCount={processingFields.size} />}
        />
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando canvas...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar canvas</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-x-4">
                <button 
                  onClick={refreshCanvas}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Tentar novamente
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Voltar à página inicial
                </button>
              </div>
            </div>
          )}
          
          {!loading && !error && canvasState && (
            <CanvasGrid 
              canvasId={id}
              canvasState={canvasState}
              onUpdateField={updateField}
              processingFields={processingFields}
            />
          )}
        </div>
      </div>
    </div>
  );
}
