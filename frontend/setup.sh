#!/bin/bash

# Script de setup do DIP-AI Frontend
echo "🚀 Configurando DIP-AI Frontend..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório frontend/"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Copiar arquivo de ambiente se não existir
if [ ! -f ".env" ]; then
    echo "⚙️ Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Edite se necessário."
else
    echo "⚙️ Arquivo .env já existe."
fi

# Verificar se o backend está rodando
echo "🔍 Verificando se o backend está ativo..."
if curl -s "http://localhost:8000" > /dev/null; then
    echo "✅ Backend detectado em http://localhost:8000"
else
    echo "⚠️ Backend não detectado. Certifique-se de que o backend esteja rodando em http://localhost:8000"
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "Para executar o projeto:"
echo "  npm run dev"
echo ""
echo "Para build de produção:"
echo "  npm run build"
echo ""
echo "O frontend estará disponível em: http://localhost:5173"
