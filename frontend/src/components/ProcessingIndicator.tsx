interface ProcessingIndicatorProps {
  processingCount: number;
}

export default function ProcessingIndicator({ processingCount }: ProcessingIndicatorProps) {
  const isProcessing = processingCount > 0;

  return (
    <div className="flex items-center space-x-2">
      {isProcessing ? (
        <>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-600 font-medium">
            {processingCount} sugestão{processingCount > 1 ? 'ões' : ''} sendo gerada{processingCount > 1 ? 's' : ''}
          </span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">
            Todas as sugestões atualizadas
          </span>
        </>
      )}
    </div>
  );
}
