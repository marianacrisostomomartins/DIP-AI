import { useState, useRef, useEffect } from 'react';
import { FieldState } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useSuggestions } from '../contexts/SuggestionsContext';

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
  const { t } = useLanguage();
  const { suggestionsEnabled } = useSuggestions();
  const [value, setValue] = useState(question.answer || '');
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [initialQuestionId, setInitialQuestionId] = useState(question.id);
  const modalRef = useRef<HTMLDivElement>(null);

  // Se a question mudou para um campo diferente, resetar o estado
  useEffect(() => {
    if (question.id !== initialQuestionId) {
      setValue(question.answer || '');
      setHasUserEdited(false);
      setInitialQuestionId(question.id);
    }
  }, [question.id, initialQuestionId]);

  // Sincronizar o valor quando a question.answer muda, mas apenas se o usuário não editou
  // e se ainda é o mesmo campo (mesmo ID)
  useEffect(() => {
    if (!hasUserEdited && question.id === initialQuestionId) {
      setValue(question.answer || '');
    }
  }, [question.answer, hasUserEdited, question.id, initialQuestionId]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setHasUserEdited(true);
  };

  const handleSave = () => {
    onSave(value);
  };

  // Fecha apenas ao pressionar ESC (não fecha ao clicar fora)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-11/12 md:w-1/2 max-h-[90vh] overflow-auto relative">
        {/* Botão X para fechar */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label={t('canvas.close')}
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">
          {question.id} <span className="font-bold">- {question.title}</span>
        </h2>
        {question.question && (
          <div className="mb-4">
            <p className="text-base text-black mb-1">{question.question}</p>
            {suggestionsEnabled && question.question_suggestion && (
              <p className="text-sm text-blue-700 italic">{question.question_suggestion}</p>
            )}
          </div>
        )}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('canvas.yourAnswer')}</h3>
          <textarea
            className="w-full border border-gray-300 rounded p-3 h-40 resize-none focus:border-blue-500 focus:outline-none"
            value={value}
            onChange={e => handleValueChange(e.target.value)}
            placeholder={t('canvas.answerPlaceholder')}
            disabled={loading}
          />
        </div>
        {suggestionsEnabled && question.answer_suggestion && (
          <div className="mb-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-semibold text-green-800 mb-1">{t('canvas.answerSuggestion')}</p>
              <p className="text-sm text-green-700 italic">{question.answer_suggestion}</p>
              <button
                className="mt-2 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => handleValueChange(question.answer_suggestion || '')}
                disabled={loading}
              >
                {t('canvas.useSuggestion')}
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            {t('canvas.cancel')}
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? t('canvas.saving') : t('canvas.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
