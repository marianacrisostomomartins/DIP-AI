#!/bin/bash

# Script de deployment para EC2
# Este script automatiza o processo de deploy do backend DIP-AI

set -e

echo "🚀 Iniciando deployment do DIP-AI Backend..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado. Por favor, configure as variáveis de ambiente."
    echo "Copie .env.sample para .env e ajuste as configurações:"
    echo "cp .env.sample .env"
    exit 1
fi

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p ssl logs

# Verificar permissões do script SSL
if [ -f "generate_ssl.sh" ]; then
    chmod +x generate_ssl.sh
fi

# Parar containers existentes (se houver)
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.yml down --remove-orphans || true

# Remover imagens antigas (opcional)
read -p "Deseja remover imagens antigas para economizar espaço? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removendo imagens antigas..."
    docker system prune -f || true
fi

# Build das imagens
echo "🔨 Construindo imagens Docker..."
docker-compose -f docker-compose.yml build --no-cache

# Iniciar os serviços
echo "▶️  Iniciando serviços..."
docker-compose -f docker-compose.yml up -d

# Aguardar que os serviços estejam prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose -f docker-compose.yml ps

# Verificar logs para possíveis erros
echo "📋 Verificando logs..."
docker-compose -f docker-compose.yml logs --tail=50

# Teste de conectividade
echo "🔍 Testando conectividade..."
if curl -f http://localhost/health &> /dev/null; then
    echo "✅ Backend está respondendo corretamente!"
else
    echo "❌ Backend não está respondendo. Verificando logs..."
    docker-compose -f docker-compose.yml logs backend
    exit 1
fi

# Configurar ngrok (opcional)
read -p "Deseja iniciar o ngrok para expor o serviço publicamente? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v ngrok &> /dev/null; then
        echo "🌐 Iniciando ngrok..."
        # Parar instâncias existentes do ngrok
        pkill -f ngrok || true
        sleep 2
        # Iniciar ngrok em background
        nohup ngrok http --url=distinctly-top-flamingo.ngrok-free.app 80 > ngrok.log 2>&1 &
        sleep 3
        echo "✅ ngrok iniciado! Verifique o arquivo ngrok.log para a URL pública."
        echo "📝 Para ver os logs do ngrok: tail -f ngrok.log"
    else
        echo "❌ ngrok não está instalado. Instale o ngrok primeiro:"
        echo "   https://ngrok.com/download"
    fi
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📝 Informações importantes:"
echo "   - Backend: http://localhost"
echo "   - Docs: http://localhost/docs"
echo "   - Health: http://localhost/health"
echo "   - ngrok logs: tail -f ngrok.log (se iniciado)"
echo ""
echo "📂 Logs:"
echo "   docker-compose -f docker-compose.yml logs -f [serviço]"
echo "   ngrok: tail -f ngrok.log"
echo ""
echo "🛠️  Comandos úteis:"
echo "   Parar: docker-compose -f docker-compose.yml down"
echo "   Reiniciar: docker-compose -f docker-compose.yml restart"
echo "   Status: docker-compose -f docker-compose.yml ps"
echo "   Parar ngrok: pkill -f ngrok"
echo ""

# Mostrar informações do sistema
echo "💻 Informações do sistema:"
echo "   Uso de disco:"
docker system df
echo ""
echo "   Containers ativos:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"