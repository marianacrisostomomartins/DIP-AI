interface CanvasCardProps {
  title: string;
  content: string;
  filled: boolean;
  onClick: () => void;
}

export default function CanvasCard({ title, content, filled, onClick }: CanvasCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer shadow-md transition-all ${
        filled ? 'bg-gray-300' : 'bg-gradient-to-tr from-blue-200 to-blue-500'
      }`}
    >
      <h3 className="text-sm font-bold mb-2">{title}</h3>
      <p className="text-xs line-clamp-3">{content || 'Clique para preencher'}</p>
    </div>
  );
}
