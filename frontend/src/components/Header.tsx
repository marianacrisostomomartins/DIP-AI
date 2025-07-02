export default function Header({ title }: { title: string }) {
  return (
    <header className="bg-white shadow px-6 py-4 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    </header>
  );
}
