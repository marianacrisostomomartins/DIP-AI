import CanvasCard from './CanvasCard';
import { useState } from 'react';
import CanvasModal from './CanvasModal';
import { CanvasState, FieldState } from '../types/api';

interface CanvasGridProps {
  canvasId: string;
  canvasState: CanvasState;
  onUpdateField: (fieldId: number, answer: string, useAsync?: boolean) => Promise<void>;
  processingFields?: Set<number>;
}

export default function CanvasGrid({ canvasId, canvasState, onUpdateField, processingFields = new Set() }: CanvasGridProps) {
  const [selected, setSelected] = useState<FieldState | null>(null);
  const [updating, setUpdating] = useState(false);

  // Usar os fields do CanvasState
  const canvasFields = canvasState?.fields || [];

  const handleSave = async (value: string) => {
    if (!selected) return;
    
    try {
      setUpdating(true);
      await onUpdateField(selected.id, value, true); // Use async by default
      setSelected(null);
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
                onClick={() => setSelected(field)}
                isProcessing={isProcessing}
              />
            </div>
          );
        })}
      </div>
      {selected && (
        <CanvasModal
          question={selected}
          onSave={handleSave}
          onClose={() => setSelected(null)}
          loading={updating}
        />
      )}
    </>
  );
}
