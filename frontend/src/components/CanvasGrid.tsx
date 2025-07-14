import CanvasCard from './CanvasCard';
import { useState, useEffect, useRef } from 'react';
import CanvasModal from './CanvasModal';
import { CanvasState, FieldState } from '../types/api';

interface CanvasGridProps {
  canvasId: string;
  canvasState: CanvasState;
  onUpdateField: (fieldId: number, answer: string, useAsync?: boolean) => Promise<void>;
  processingFields?: Set<number>;
  setModalOpen: (fieldId: number | null) => void;
}

export default function CanvasGrid({ canvasId, canvasState, onUpdateField, processingFields = new Set(), setModalOpen }: CanvasGridProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  // Usar os fields do CanvasState
  const canvasFields = canvasState?.fields || [];
  
  // Encontrar o field selecionado atual (pode ter mudado com a atualização do estado)
  const selected = selectedFieldId ? canvasFields.find(field => field.id === selectedFieldId) || null : null;

  // Verificar se o campo selecionado ainda existe após atualizações
  useEffect(() => {    
    // Notificar o hook sobre o estado do modal
    setModalOpen(selectedFieldId);
    
    if (selectedFieldId && !selected) {
      console.warn(`Campo selecionado ${selectedFieldId} não foi encontrado após atualização. Fechando modal.`);
      setSelectedFieldId(null);
      setModalOpen(null);
    }
  }, [selectedFieldId, selected, canvasFields.length, setModalOpen]);

  const handleSave = async (value: string) => {
    if (!selected) return;
    
    try {
      setUpdating(true);
      await onUpdateField(selected.id, value, true); // Use async by default
      setSelectedFieldId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setUpdating(false);
    }
  };

  // Verificação de segurança
  if (!canvasFields || canvasFields.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhum campo encontrado no canvas.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {canvasFields.map((field) => {
          const isProcessing = processingFields.has(field.id);
          return (
            <div key={field.id}>
              <CanvasCard
                field={field}
                onClick={() => setSelectedFieldId(field.id)}
                isProcessing={isProcessing}
              />
            </div>
          );
        })}
      </div>
      {selected && (
        <CanvasModal
          key={selectedFieldId} // Key estável baseada no ID
          question={selected}
          onSave={handleSave}
          onClose={() => {
            setSelectedFieldId(null);
            setModalOpen(null);
          }}
          loading={updating}
        />
      )}
    </>
  );
}
