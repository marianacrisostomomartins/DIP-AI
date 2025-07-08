import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function MeusProjetos() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-48">
        <Header title="Meus Projetos" />
        <div className="p-8 flex gap-8">
          {/* Quadro Meus Projetos */}
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Meus Projetos</h2>
            {/* Lista de projetos do usuário */}
            <div className="text-gray-600">(Aqui aparecerá a lista dos seus projetos)</div>
          </div>
          {/* Quadro Projetos Compartilhados */}
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Projetos Compartilhados Comigo</h2>
            {/* Lista de projetos compartilhados */}
            <div className="text-gray-600">(Aqui aparecerá a lista de projetos compartilhados com você)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
