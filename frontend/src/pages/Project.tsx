import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CanvasGrid from '../components/CanvasGrid';
import ProcessingIndicator from '../components/ProcessingIndicator';
import { useCanvas } from '../hooks/useCanvas';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';

export default function Project() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { canvasState, canvasName, loading, error, updateField, refreshCanvas, processingFields, setModalOpen } = useCanvas(id || '');

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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('project.canvasIdNotFound')}</h1>
          <p className="text-gray-600 mb-6">{t('project.projectNotFound')}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t('project.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar canvasId={id} canvasState={canvasState} canvasName={canvasName} />
      <div className="flex-1 ml-48">
        <Header 
          title={canvasName || `Canvas #${id}`} 
          statusIndicator={<ProcessingIndicator processingCount={processingFields.size} />}
        />
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">{t('project.loadingCanvas')}</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-red-600 mb-2">{t('project.errorLoadingCanvas')}</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-x-4">
                <button 
                  onClick={refreshCanvas}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t('project.tryAgain')}
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {t('project.backToHomePage')}
                </button>
              </div>
            </div>
          )}
          
          {!loading && !error && canvasState && canvasState.fields && canvasState.fields.length > 0 && (
            <CanvasGrid 
              canvasId={id}
              canvasState={canvasState}
              onUpdateField={updateField}
              processingFields={processingFields}
              setModalOpen={setModalOpen}
            />
          )}
          
          {!loading && !error && canvasState && (!canvasState.fields || canvasState.fields.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-600">{t('project.noFieldsFound')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
