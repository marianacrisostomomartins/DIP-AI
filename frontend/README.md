# DIP-AI Frontend

Interface web para o sistema DIP-AI Canvas, desenvolvida em React + TypeScript + Tailwind CSS.

## Funcionalidades Implementadas

### Autenticação
- ✅ Login com email/senha
- ✅ Registro de novos usuários
- ✅ Proteção de rotas privadas
- ✅ Sistema de tokens JWT
- ✅ Logout automático

### Gerenciamento de Canvas
- ✅ Listagem de canvas do usuário
- ✅ Criação de novos canvas
- ✅ Exclusão de canvas (apenas proprietário)
- ✅ Navegação entre canvas
- 🔄 Edição do nome do canvas (pendente no backend)
- 🔄 Compartilhamento com outros usuários

### Canvas DIP-AI
- ✅ Grid interativo com campos do canvas
- ✅ Modal para edição de campos
- ✅ Processamento assíncrono com LLM
- ✅ Sugestões automáticas do sistema
- ✅ Polling de status dos jobs
- ✅ Estados visuais (preenchido/vazio)
- ✅ Loading states durante processamento

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

## Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Router DOM** - Roteamento
- **Vite** - Build tool e dev server

## Como executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Backend DIP-AI executando em `http://localhost:8000`

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

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── CanvasCard.tsx   # Card individual do canvas
│   ├── CanvasGrid.tsx   # Grid de campos do canvas
│   ├── CanvasModal.tsx  # Modal de edição
│   ├── Header.tsx       # Cabeçalho da aplicação
│   ├── PrivateRoute.tsx # Proteção de rotas
│   └── Sidebar.tsx      # Barra lateral
├── hooks/               # Hooks personalizados
│   └── useCanvas.ts     # Hook para gerenciar canvas
├── pages/               # Páginas da aplicação
│   ├── Home.tsx         # Lista de canvas
│   ├── Login.tsx        # Página de login
│   ├── Project.tsx      # Visualização do canvas
│   ├── Signup.tsx       # Registro de usuário
│   ├── NotFound.tsx     # Página 404
│   └── RecuperarSenha.tsx # Recuperação de senha
├── services/            # Serviços externos
│   └── api.ts           # Cliente da API REST
├── types/               # Definições de tipos
│   └── api.ts           # Tipos da API
└── styles/              # Estilos globais
    └── index.css        # CSS principal com Tailwind
```

## Fluxo de Dados

### Autenticação
1. Usuário faz login → Token JWT armazenado no localStorage
2. Requests incluem `Authorization: Bearer <token>`
3. PrivateRoute verifica token antes de renderizar páginas protegidas

### Canvas Workflow
1. Usuário carrega canvas → `useCanvas` busca estado inicial
2. Usuário edita campo → Modal abre com dados atuais
3. Usuário salva → Request assíncrono enviado
4. Sistema inicia polling do job → Atualiza estado quando completo
5. Interface mostra sugestões LLM quando disponíveis

### Estados da Interface
- **Loading**: Durante carregamento inicial ou processamento
- **Error**: Em caso de falhas na API com retry
- **Success**: Estado normal com dados carregados
- **Processing**: Durante atualização de campos com LLM

## Próximos Passos

### Funcionalidades Pendentes
- [ ] Implementar recuperação de senha
- [ ] Melhorar sistema de compartilhamento
- [ ] Adicionar notificações em tempo real
- [ ] Implementar cache local dos canvas
- [ ] Adicionar modo offline básico
- [ ] Melhorar acessibilidade (ARIA labels)

### Melhorias Técnicas
- [ ] Implementar React Query para cache
- [ ] Adicionar testes unitários (Jest + Testing Library)
- [ ] Configurar CI/CD pipeline
- [ ] Adicionar linting mais rigoroso
- [ ] Implementar lazy loading de rotas
- [ ] Configurar PWA capabilities

### UX/UI
- [ ] Adicionar skeleton loaders
- [ ] Implementar animações de transição
- [ ] Melhorar responsividade mobile
- [ ] Adicionar tema escuro
- [ ] Implementar drag & drop nos cards
