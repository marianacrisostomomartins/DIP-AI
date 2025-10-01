import { useLanguage } from '../contexts/LanguageContext';

interface ProcessingIndicatorProps {
  processingCount: number;
}

export default function ProcessingIndicator({ processingCount }: ProcessingIndicatorProps) {
  const { t } = useLanguage();
  const isProcessing = processingCount > 0;

  return (
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
  );
}
