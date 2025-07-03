
import { useState } from 'react';

interface CanvasCardProps {
  id: number;
  title: string;
  question: string;
  answer: string; // sugestão do backend
  filled: boolean;
  onClick: () => void;
  onSubmit?: (id: number, resposta: string) => void;
}

export default function CanvasCard({ id, title, question, answer, filled, onClick, onSubmit }: CanvasCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [resposta, setResposta] = useState(answer || '');

  const handleEdit = () => {
    setEditMode(true);
    setResposta(answer || '');
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResposta(e.target.value);
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(id, resposta);
    setEditMode(false);
  };

  const handleUseSuggestion = () => {
    setResposta(answer || '');
    if (onSubmit) onSubmit(id, answer || '');
    setEditMode(false);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer shadow-md transition-all ${
        filled ? 'bg-gray-300' : 'bg-gradient-to-tr from-blue-200 to-blue-500'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">#{id}</span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="mb-2">
        <span className="block text-xs font-medium text-gray-700">Enunciado:</span>
        <p className="text-xs line-clamp-3 text-gray-800">{question || 'Clique para preencher'}</p>
      </div>
      <div>
        <span className="block text-xs font-medium text-gray-700">Resposta:</span>
        {editMode ? (
          <>
            <textarea
              className="w-full mt-1 p-2 rounded border border-gray-300 text-xs"
              value={resposta}
              onChange={handleInput}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                onClick={e => { e.stopPropagation(); handleSubmit(); }}
              >
                Enviar
              </button>
              <button
                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                onClick={e => { e.stopPropagation(); setEditMode(false); }}
              >
                Cancelar
              </button>
              <button
                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                onClick={e => { e.stopPropagation(); handleUseSuggestion(); }}
                disabled={!answer}
              >
                Usar sugestão
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs line-clamp-3 text-gray-800">{resposta || 'Clique para preencher'}</p>
            <div className="flex gap-2 mt-2">
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                onClick={e => { e.stopPropagation(); setEditMode(true); }}
              >
                {resposta ? 'Editar resposta' : 'Responder'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
