import { useState } from 'react';
import { FieldState } from '../types/api';

interface CanvasModalProps {
  question: FieldState;
  onSave: (value: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function CanvasModal({
  question,
  onSave,
  onClose,
  loading = false
}: CanvasModalProps) {
  const [value, setValue] = useState(question.answer || '');

  const handleSave = () => {
    onSave(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/2 max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">{question.title}</h2>
        
        {question.question && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Pergunta:</h3>
            <p className="text-sm text-gray-600">{question.question}</p>
          </div>
        )}
        
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Sua resposta:</h3>
          <textarea
            className="w-full border border-gray-300 rounded p-3 h-40 resize-none focus:border-blue-500 focus:outline-none"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            disabled={loading}
          />
        </div>
        
        {(question.question_suggestion || question.answer_suggestion) && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Sugestões:</h3>
            <div className="space-y-2">
              {question.question_suggestion && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-800 mb-1">Pergunta sugerida:</p>
                  <p className="text-sm text-blue-700 italic">{question.question_suggestion}</p>
                </div>
              )}
              {question.answer_suggestion && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-800 mb-1">Resposta sugerida:</p>
                  <p className="text-sm text-green-700 italic">{question.answer_suggestion}</p>
                  <button
                    className="mt-2 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => setValue(question.answer_suggestion || '')}
                    disabled={loading}
                  >
                    Usar esta sugestão
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
