
import { FieldState } from '../types/api';

interface CanvasCardProps {
  field: FieldState;
  onClick: () => void;
  isProcessing?: boolean;
}

export default function CanvasCard({ field, onClick, isProcessing = false }: CanvasCardProps) {
  const filled = !!field.answer;
  
  return (
    <div
      className={`
        relative border rounded-xl p-4 cursor-pointer transition-all duration-200 min-h-[120px] flex flex-col
        ${filled 
          ? 'border-green-400 bg-green-50 hover:bg-green-100 shadow-md' 
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-800 truncate">{field.id} - {field.title}</h3>
        {filled && (
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
            isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
          }`} />
        )}
      </div>
      
      <div className="flex-1 overflow-hidden space-y-2">
        <p className="text-xs text-gray-600 font-medium">
          {field.question}
        </p>
        
        {field.answer ? (
          <p className="text-xs text-gray-800 line-clamp-3">
            {field.answer}
          </p>
        ) : (
          <div className="space-y-1">
            {field.question_suggestion && (
              <p className="text-xs text-gray-500 italic line-clamp-2">
                Pergunta sugerida: {field.question_suggestion}
              </p>
            )}
            {field.answer_suggestion && (
              <p className="text-xs text-gray-500 italic line-clamp-2">
                Resposta sugerida: {field.answer_suggestion}
              </p>
            )}
          </div>
        )}
      </div>
      
      {filled && (
        <div className={`mt-2 text-xs font-medium flex items-center ${
          isProcessing ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {isProcessing ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
              Gerando sugestões...
            </>
          ) : (
            '✓ Preenchido'
          )}
        </div>
      )}
    </div>
  );
}
