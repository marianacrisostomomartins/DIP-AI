# DIP-AI Frontend

Interface web para o sistema DIP-AI Canvas, desenvolvida em React + TypeScript + Tailwind CSS.

## Integração com Backend

### Rotas da API Integradas
- `POST /register` - Registro de usuários
- `POST /token` - Login/autenticação
- `POST /create_canvas` - Criação de canvas
- `GET /list_canvas` - Listagem de canvas
- `DELETE /canvas/{canvas_id}` - Exclusão de canvas
- `GET /canvas/state/{canvas_id}` - Estado do canvas
- `POST /canvas/{canvas_id}/field/{field_id}` - Atualização assíncrona
- `POST /canvas/{canvas_id}/field/{field_id}/sync` - Atualização síncrona
- `GET /canvas/{canvas_id}/job/{job_id}` - Status do job
- `POST /canvas/invite/{canvas_id}` - Convite de usuários

### Hook Personalizado
O `useCanvas` hook centraliza a lógica de:
- Carregamento do estado do canvas
- Atualização de campos com processamento LLM
- Polling automático de jobs
- Gerenciamento de estados de loading/error

## Como executar

### Instalação
```bash
# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração
Edite o arquivo `.env` com as configurações necessárias:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Deploy em Produção

### 1. Preparação do Servidor
```bash
# Clonar o repositório
git clone https://github.com/marianacrisostomomartins/DIP-AI.git
cd DIP-AI/frontend

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

### 2. Deploy Simples
```bash
# Deploy apenas do frontend
docker-compose up -d frontend

# Verificar saúde da aplicação
curl http://localhost:8080/health
```

### 3. Deploy com Proxy Reverso e SSL
```bash
# Configurar variáveis de ambiente para produção
export VIRTUAL_HOST=seudominio.com
export LETSENCRYPT_HOST=seudominio.com
export LETSENCRYPT_EMAIL=seu-email@exemplo.com

# Deploy completo com proxy e SSL
docker-compose --profile production up -d frontend

# Verificar todos os serviços
docker-compose ps
```

### Atualizações

#### Atualizar a aplicação
```bash
# Baixar últimas mudanças
git pull origin main

# Rebuild e redeploy
docker-compose build frontend
docker-compose up -d frontend
```

#### Rebuild completo
```bash
# Parar todos os serviços
docker-compose down

# Rebuild sem cache
docker-compose build --no-cache

# Deploy novamente
docker-compose up -d
```

### Monitoramento

#### Verificar status
```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Logs apenas do frontend
docker-compose logs -f frontend

# Verificar recursos
docker stats
```

#### Health Check
```bash
# Verificar saúde da aplicação
curl http://localhost:8080/health

# Ou para produção com domínio
curl https://seudominio.com/health
```

### Comandos Úteis

```bash
# Verificar status
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Restart apenas frontend
docker-compose restart frontend

# Backup da configuração
docker-compose config > backup-config.yml

# Cleanup
docker-compose down --volumes --remove-orphans
```
