
import { FieldState } from '../types/api';

interface CanvasCardProps {
  field: FieldState;
  onClick: () => void;
  isProcessing?: boolean;
}

export default function CanvasCard({ field, onClick, isProcessing = false }: CanvasCardProps) {
  const filled = !!field.answer;

  // Função para definir as cores conforme o id
  const getColorClasses = (id: number, filled: boolean) => {
    if (id >= 1 && id <= 6) {
      return filled
        ? 'border-blue-500 bg-blue-200 hover:bg-blue-300 shadow-md'
        : 'border-blue-300 bg-blue-100 hover:bg-blue-200 hover:border-blue-400';
    } else if (id >= 7 && id <= 12) {
      return filled
        ? 'border-yellow-500 bg-yellow-200 hover:bg-yellow-300 shadow-md'
        : 'border-yellow-300 bg-yellow-100 hover:bg-yellow-200 hover:border-yellow-400';
    } else if (id >= 13 && id <= 16) {
      return filled
        ? 'border-orange-500 bg-orange-200 hover:bg-orange-300 shadow-md'
        : 'border-orange-300 bg-orange-100 hover:bg-orange-200 hover:border-orange-400';
    } else if (id >= 17 && id <= 19) {
      return filled
        ? 'border-red-500 bg-red-200 hover:bg-red-300 shadow-md'
        : 'border-red-300 bg-red-100 hover:bg-red-200 hover:border-red-400';
    } else if (id >= 20 && id <= 28) {
      return filled
        ? 'border-green-500 bg-green-200 hover:bg-green-300 shadow-md'
        : 'border-green-300 bg-green-100 hover:bg-green-200 hover:border-green-400';
    }
    // Default
    return filled
      ? 'border-gray-500 bg-gray-200 hover:bg-gray-300 shadow-md'
      : 'border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-blue-400';
  };

  // Cor do indicador de preenchido
  const getIndicatorColor = (id: number) => {
    if (id >= 1 && id <= 6) return 'bg-blue-500';
    if (id >= 7 && id <= 12) return 'bg-yellow-400';
    if (id >= 13 && id <= 16) return 'bg-orange-500';
    if (id >= 17 && id <= 19) return 'bg-red-500';
    if (id >= 20 && id <= 28) return 'bg-green-500';
    return 'bg-gray-400';
  };

  // Cor do texto do indicador de preenchido
  const getIndicatorTextColor = (id: number) => {
    if (id >= 1 && id <= 6) return 'text-blue-500';
    if (id >= 7 && id <= 12) return 'text-yellow-500';
    if (id >= 13 && id <= 16) return 'text-orange-500';
    if (id >= 17 && id <= 19) return 'text-red-500';
    if (id >= 20 && id <= 28) return 'text-green-500';
    return 'text-gray-400';
  };

  return (
    <div
      className={`
        relative border rounded-xl p-4 cursor-pointer transition-all duration-200 min-h-[120px] flex flex-col
        ${getColorClasses(field.id, filled)}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-md text-gray-800 truncate">{field.id} - {field.title}</h3>
        {filled && (
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
            isProcessing ? 'bg-yellow-500 animate-pulse' : getIndicatorColor(field.id)
          }`} />
        )}
      </div>

      <div className="flex-1 overflow-hidden space-y-2">
        <p className="text-xs text-gray-800 font-medium">
          {field.question}
        </p>

        {field.answer ? (
          <p className="font-semibold text-xs text-gray-800 line-clamp-3">
            {field.answer}
          </p>
        ) : (
          <div className="space-y-1">
            {field.question_suggestion && (
              <p className="text-xs text-gray-800 italic line-clamp-2">
                {field.question_suggestion}
              </p>
            )}
            {field.answer_suggestion && (
              <p className="text-xs text-green-500 italic line-clamp-2">
                {field.answer_suggestion}
              </p>
            )}
          </div>
        )}
      </div>

      {filled && (
        <div className={`mt-2 text-xs font-medium flex items-center ${
          isProcessing ? 'text-yellow-600' : getIndicatorTextColor(field.id)
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
