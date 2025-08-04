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
  const [visibleSections, setVisibleSections] = useState(new Set(['objetivos', 'processos', 'priorizacao', 'tarefas', 'viabilidade']));

  // Função para alternar a visibilidade de uma seção
  const toggleSection = (section: string) => {
    setVisibleSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Alternar entre mostrar todas ou nenhuma seção
  const toggleAllSections = () => {
    if (visibleSections.size === 5) {
      setVisibleSections(new Set()); // Desmarca todas
    } else {
      setVisibleSections(new Set(['objetivos', 'processos', 'priorizacao', 'tarefas', 'viabilidade'])); // Marca todas
    }
  };

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

  // Função para agrupar os campos por seção
  const groupedFields = {
    objetivos: canvasFields.filter(field => field.id >= 1 && field.id <= 6),
    processos: canvasFields.filter(field => field.id >= 7 && field.id <= 12),
    priorizacao: canvasFields.filter(field => field.id >= 13 && field.id <= 16),
    tarefas: canvasFields.filter(field => field.id >= 17 && field.id <= 19),
    viabilidade: canvasFields.filter(field => field.id >= 20 && field.id <= 28),
  };

  return (
    <>
      {/* Botões de filtro */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={toggleAllSections}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:rotate-180 duration-300 relative
              ${visibleSections.size === 5
                ? 'ring-1 ring-white ring-offset-1 shadow-md'
                : 'opacity-75'
              }
              bg-[conic-gradient(#2563eb,#eab308,#f97316,#ef4444,#22c55e,#2563eb)]
              animate-spin-slow hover:animate-none`}
            title={visibleSections.size === 5 ? "Ocultar Todas as Seções" : "Mostrar Todas as Seções"}
          >
            <span className="sr-only">{visibleSections.size === 5 ? "Ocultar Todas as Seções" : "Mostrar Todas as Seções"}</span>
            <svg className={`h-4 w-4 transition-opacity duration-300 ${visibleSections.size === 5 ? 'opacity-100' : 'opacity-50'}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle fill="#fff" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
            </svg>
          </button>
          
          <button
            onClick={() => toggleSection('objetivos')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors
              ${visibleSections.has('objetivos')
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
          >
            Objetivos do Negócio
          </button>

          <button
            onClick={() => toggleSection('processos')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors
              ${visibleSections.has('processos')
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
          >
            Caracterização dos Processos
          </button>

          <button
            onClick={() => toggleSection('priorizacao')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors
              ${visibleSections.has('priorizacao')
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
          >
            Priorização
          </button>

          <button
            onClick={() => toggleSection('tarefas')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors
              ${visibleSections.has('tarefas')
                ? 'bg-red-500 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
          >
            Identificação de Tarefas de Dados
          </button>

          <button
            onClick={() => toggleSection('viabilidade')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors
              ${visibleSections.has('viabilidade')
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
          >
            Análise de Viabilidade
          </button>
        </div>
      </div>

      <div className="space-y-8 mt-4">
        {/* Seção Objetivos do Negócio */}
        {visibleSections.has('objetivos') && (
          <div>
            <h2 className="text-xl font-bold text-blue-700 mb-4">Objetivos do Negócio</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groupedFields.objetivos.map((field) => (
                <div key={field.id}>
                  <CanvasCard
                    field={field}
                    onClick={() => setSelectedFieldId(field.id)}
                    isProcessing={processingFields.has(field.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Caracterização dos Processos */}
        {visibleSections.has('processos') && (
          <div>
            <h2 className="text-xl font-bold text-yellow-600 mb-4">Caracterização dos Processos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groupedFields.processos.map((field) => (
                <div key={field.id}>
                  <CanvasCard
                    field={field}
                    onClick={() => setSelectedFieldId(field.id)}
                    isProcessing={processingFields.has(field.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Priorização */}
        {visibleSections.has('priorizacao') && (
          <div>
            <h2 className="text-xl font-bold text-orange-600 mb-4">Priorização</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groupedFields.priorizacao.map((field) => (
                <div key={field.id}>
                  <CanvasCard
                    field={field}
                    onClick={() => setSelectedFieldId(field.id)}
                    isProcessing={processingFields.has(field.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Identificação de Tarefas de Dados */}
        {visibleSections.has('tarefas') && (
          <div>
            <h2 className="text-xl font-bold text-red-600 mb-4">Identificação de Tarefas de Dados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groupedFields.tarefas.map((field) => (
                <div key={field.id}>
                  <CanvasCard
                    field={field}
                    onClick={() => setSelectedFieldId(field.id)}
                    isProcessing={processingFields.has(field.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Análise de Viabilidade */}
        {visibleSections.has('viabilidade') && (
          <div>
            <h2 className="text-xl font-bold text-green-600 mb-4">Análise de Viabilidade</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {groupedFields.viabilidade.map((field) => (
                <div key={field.id}>
                  <CanvasCard
                    field={field}
                    onClick={() => setSelectedFieldId(field.id)}
                    isProcessing={processingFields.has(field.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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
