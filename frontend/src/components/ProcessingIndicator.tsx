import { useLanguage } from '../contexts/LanguageContext';
import { useSuggestions } from '../contexts/SuggestionsContext';

interface ProcessingIndicatorProps {
  processingCount: number;
}

export default function ProcessingIndicator({ processingCount }: ProcessingIndicatorProps) {
  const { t } = useLanguage();
  const { suggestionsEnabled, setSuggestionsEnabled } = useSuggestions();
  const isProcessing = processingCount > 0;

  return (
    <div className="flex items-center space-x-4">
      {/* Status de processamento - só mostra se sugestões estão habilitadas */}
      {suggestionsEnabled && (
        <div className="flex items-center space-x-2">
          {isProcessing ? (
            <>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-600 font-medium">
                {processingCount} {processingCount > 1 ? t('processing.generatingPlural') : t('processing.generating')}
              </span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">
                {t('processing.allUpdated')}
              </span>
            </>
          )}
        </div>
      )}

      {/* Toggle IA */}
      <div className="flex items-center gap-2 relative group">
        <span className="text-lg">🤖</span>
        <label className="relative inline-flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={suggestionsEnabled}
            onChange={(e) => setSuggestionsEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className={`relative w-8 h-4 rounded-full peer transition-colors duration-200 ease-in-out ${
            suggestionsEnabled 
              ? 'bg-blue-600' 
              : 'bg-gray-300'
          } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300`}>
            <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-3 w-3 transition-transform duration-200 ease-in-out ${
              suggestionsEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}>
            </div>
          </div>
          
          {/* Tooltip customizada */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
            {suggestionsEnabled 
              ? t('canvas.suggestionsEnabledDescription')
              : t('canvas.suggestionsDisabledDescription')
            }
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </label>
      </div>
    </div>
  );
}
