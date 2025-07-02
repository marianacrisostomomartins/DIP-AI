import CanvasCard from './CanvasCard';
import { useState } from 'react';
import CanvasModal from './CanvasModal';

const mockCanvas = [
  { id: 1, title: 'Problema', content: '', filled: false },
  { id: 2, title: 'Solução', content: '', filled: false },
  { id: 3, title: 'Objetivo', content: '', filled: false },
  { id: 4, title: 'Stakeholders', content: '', filled: false },
];

export default function CanvasGrid() {
  const [canvas, setCanvas] = useState(mockCanvas);
  const [selected, setSelected] = useState<any | null>(null);

  const handleSave = (value: string) => {
    if (!selected) return; // Evita erro se selected for null
    setCanvas((prev) =>
      prev.map((c) =>
        c.id === selected.id ? { ...c, content: value, filled: true } : c
      )
    );
    setSelected(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {canvas.map((item) => {
          return (
            <div key={item.id}>
              <CanvasCard
                title={item.title}
                content={item.content}
                filled={item.filled}
                onClick={() => setSelected(item)}
              />
            </div>
          );
        })}
      </div>
      {selected && (
        <CanvasModal
          question={selected}
          onSave={handleSave}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
