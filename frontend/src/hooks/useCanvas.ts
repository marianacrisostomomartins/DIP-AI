import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '../services/api';
import { CanvasState, FieldState } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';

export interface UseCanvasReturn {
  canvasState: CanvasState | null;
  canvasName: string;
  loading: boolean;
  error: string;
  processingFields: Set<number>; // IDs dos campos sendo processados
  updateField: (fieldId: number, answer: string, useAsync?: boolean) => Promise<void>;
  refreshCanvas: () => Promise<void>;
  setModalOpen: (fieldId: number | null) => void; // Nova função para reportar estado do modal
}

export function useCanvas(canvasId: string): UseCanvasReturn {
  const { language } = useLanguage();
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [canvasName, setCanvasName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingFields, setProcessingFields] = useState<Set<number>>(new Set());
  const [activeJobs, setActiveJobs] = useState<Map<number, string>>(new Map());
  const [openModalFieldId, setOpenModalFieldId] = useState<number | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState(false);

  // Quando o modal fecha, verificar se há atualização pendente
  useEffect(() => {
    if (canvasId) {
      loadCanvasState();
    }
  }, [canvasId]);

  // Recarregar quando o idioma mudar
  useEffect(() => {
    if (canvasId && canvasState) {
      loadCanvasState();
    }
  }, [language]);

  const loadCanvasState = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getCanvasState(canvasId, language);
      setCanvasState(response.canvas_state);
      setCanvasName(response.name);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // O redirecionamento já será feito pelo handleResponse
          setError('Sessão expirada');
          return;
        }
        setError(err.message);
      } else {
        setError('Erro ao carregar canvas');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (fieldId: number, answer: string, useAsync = true) => {
    try {
      if (useAsync) {
        // 1. Marcar campo como sendo processado
        setProcessingFields(prev => new Set(prev).add(fieldId));
        
        // 2. Fazer chamada async e obter resposta imediata
        const response = await apiClient.updateFieldAsync(canvasId, fieldId.toString(), { answer });
        
        // 3. Atualizar estado imediatamente com resposta parcial
        setCanvasState(response.canvas_state);
        setCanvasName(response.name);
        
        // 4. Armazenar job_id para este campo
        setActiveJobs(prev => new Map(prev).set(fieldId, response.job_id));
        
        // 5. Iniciar polling em background (não awaitar)
        pollJobInBackground(fieldId, response.job_id);
        
      } else {
        // Processamento síncrono (mantém comportamento original)
        const response = await apiClient.updateFieldSync(canvasId, fieldId.toString(), { answer });
        setCanvasState(response.canvas_state);
        setCanvasName(response.name);
      }
    } catch (err) {
      // Remover campo da lista de processamento em caso de erro
      setProcessingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          throw new Error('Sessão expirada');
        }
        throw new Error(err.message);
      } else {
        throw new Error('Erro ao atualizar campo');
      }
    }
  };

  // Função para fazer polling em background
  const pollJobInBackground = async (fieldId: number, jobId: string) => {
    try {
      const job = await apiClient.pollJobUntilComplete(canvasId, jobId);
      
      // Job completou - limpar estados
      setProcessingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
      
      setActiveJobs(prev => {
        const newMap = new Map(prev);
        newMap.delete(fieldId);
        return newMap;
      });
      
      if (job.status === 'completed') {
        // 6. Só recarregar estado final se não houver modal aberto
        if (openModalFieldId === null) {
          await loadCanvasState();
        } else {
          console.log('Modal aberto, marcando atualização como pendente');
          setPendingUpdate(true);
        }
      } else if (job.status === 'failed') {
        console.error(`Job ${jobId} falhou:`, job.error);
        // Você pode adicionar uma notificação de erro aqui se necessário
      }
    } catch (error) {
      console.error(`Erro no polling do job ${jobId}:`, error);
      
      // Limpar estados mesmo em caso de erro
      setProcessingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
      
      setActiveJobs(prev => {
        const newMap = new Map(prev);
        newMap.delete(fieldId);
        return newMap;
      });
    }
  };

  const refreshCanvas = async () => {
    await loadCanvasState();
  };

  useEffect(() => {
    if (canvasId) {
      loadCanvasState();
    }
  }, [canvasId, language]); // Recarregar quando o idioma mudar

  return {
    canvasState,
    canvasName,
    loading,
    error,
    processingFields,
    updateField,
    refreshCanvas,
    setModalOpen: setOpenModalFieldId
  };
}
