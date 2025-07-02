import { useState } from 'react';

export default function CanvasModal({
  question,
  onSave,
  onClose,
}: {
  question: { title: string; content: string };
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(question.content || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/2 max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">{question.title}</h2>
        <textarea
          className="w-full border border-gray-300 rounded p-2 h-40 resize-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end mt-4 gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => onSave(value)}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
