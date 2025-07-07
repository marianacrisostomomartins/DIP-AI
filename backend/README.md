# DIP‑AI Interview Backend

Esta aplicação implementa um backend em Python (FastAPI) para conduzir entrevistas via LLM, auxiliando o usuário a preencher um Canvas de 28 campos (DIP‑AI). Usa Ollama como provedor de LLM e orquestra a lógica de perguntas/respostas com LangGraph.

## Estrutura do projeto [TODO]

- `app/main.py`: servidor FastAPI com rotas REST e WebSocket.
- `app/state.py`: modelos Pydantic para Canvas e estado.
- `app/llm_client.py`: cliente Ollama HTTP.
- `app/prompts/update_sugestions`: prompt para atualizar as sugestões de resposta e pergunta.
- `requirements.txt`: dependências.

## Criando BD - PostgreSQL (caso não exista)

```bash
docker run --name dip-postgres -e POSTGRES_USER=dipuser -e POSTGRES_PASSWORD=dippassword -e POSTGRES_DB=dipdb -p 5432:5432 -d postgres:15
```

### Criando as tabelas do banco de dados

O backend utiliza SQLAlchemy para definir os modelos ORM e criar as tabelas necessárias no banco PostgreSQL. Siga um dos métodos abaixo para criar as tabelas:

#### 1. Usando o script Python

Execute o script `init_db.py` para criar as tabelas automaticamente no banco configurado:

```bash
cd backend/app
python3 -m app.db.init_db
```

Certifique-se de que a variável de ambiente `DATABASE_URL` está configurada corretamente (ou edite o valor padrão em `db.py`).

#### Tabelas criadas
- users
- reports
- user_reports (tabela associativa)

Os modelos estão definidos em `backend/app/models_orm.py`.

## Como executar Backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Fluxo recomendado para Frontend

1. Usuário preenche campo → Frontend chama POST /canvas/{canvas_id}/field/{field_id}
2. Resposta imediata com job_id e estado atualizado (sem sugestões ainda)
3. Polling do status via GET /canvas/{canvas_id}/field/{field_id}/job/{job_id}
4. Quando job completo → Frontend chama GET /canvas/state/{canvas_id} para obter estado final

## Rotas da API

### Autenticação

#### `GET /`
- **Descrição**: Rota raiz que retorna informações básicas sobre a API
- **Autenticação**: Não requerida
- **Resposta**: 
  ```json
  {
    "message": "DIP-AI Canvas API",
    "version": "0.1.0"
  }
  ```

#### `POST /register`
- **Descrição**: Registra um novo usuário no sistema
- **Autenticação**: Não requerida
- **Body**: Form data (application/x-www-form-urlencoded)
  - `username`: Email do usuário
  - `password`: Senha do usuário
- **Resposta**: `true` em caso de sucesso
- **Erros**:
  - `409`: Email já registrado
  - `400`: Erro ao registrar usuário

#### `POST /token`
- **Descrição**: Autentica usuário e retorna token de acesso
- **Autenticação**: Não requerida
- **Body**: Form data (application/x-www-form-urlencoded)
  - `username`: Email do usuário
  - `password`: Senha do usuário
- **Resposta**: 
  ```json
  {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer"
  }
  ```
- **Erros**:
  - `400`: Email ou senha incorretos

### Canvas

#### `POST /create_canvas`
- **Descrição**: Cria um novo canvas
- **Autenticação**: Bearer Token requerido
- **Parâmetros**: 
  - `name` (query string): Nome do canvas
- **Resposta**: Objeto `Canvas`
- **Erros**:
  - `409`: Canvas com esse nome já existe
  - `404`: Usuário não encontrado

#### `DELETE /canvas/{canvas_id}`
- **Descrição**: Deleta um canvas (apenas o proprietário pode deletar)
- **Autenticação**: Bearer Token requerido
- **Parâmetros**:
  - `canvas_id` (path): ID do canvas
- **Resposta**: `true` em caso de sucesso
- **Erros**:
  - `404`: Canvas não encontrado
  - `403`: Apenas o proprietário pode deletar o canvas

#### `GET /list_canvas`
- **Descrição**: Lista todos os canvas do usuário autenticado
- **Autenticação**: Bearer Token requerido
- **Resposta**: Array de objetos `Canvas`

#### `POST /canvas/invite/{canvas_id}`
- **Descrição**: Convida um usuário para colaborar no canvas
- **Autenticação**: Bearer Token requerido
- **Parâmetros**:
  - `canvas_id` (path): ID do canvas
  - `email` (query string): Email do usuário a ser convidado
- **Resposta**: `true` em caso de sucesso
- **Erros**:
  - `403`: Usuário não tem permissão para convidar ou usuário já possui acesso
  - `404`: Usuário não encontrado

#### `GET /canvas/state/{canvas_id}`
- **Descrição**: Obtém o estado atual do canvas
- **Autenticação**: Bearer Token requerido
- **Parâmetros**:
  - `canvas_id` (path): ID do canvas
- **Resposta**: Objeto `CanvasState`
- **Erros**:
  - `403`: Canvas não encontrado ou acesso negado

### Campos do Canvas

#### `POST /canvas/{canvas_id}/field/{field_id}/sync`
- **Descrição**: Atualiza a resposta de um campo de forma síncrona (com processamento LLM imediato)
- **Autenticação**: Bearer Token requerido
- **Parâmetros**:
  - `canvas_id` (path): ID do canvas
  - `field_id` (path): ID do campo
- **Body**: Objeto `FieldAnswer`
  ```json
  {
    "answer": "resposta do usuário"
  }
  ```
- **Resposta**: Objeto `CanvasState` atualizado
- **Erros**:
  - `403`: Canvas não encontrado ou acesso negado

#### `POST /canvas/{canvas_id}/field/{field_id}`
- **Descrição**: Atualiza a resposta de um campo de forma assíncrona (processamento LLM em background)
- **Autenticação**: Bearer Token requerido
- **Parâmetros**:
  - `canvas_id` (path): ID do canvas
  - `field_id` (path): ID do campo
- **Body**: Objeto `FieldAnswer`
  ```json
  {
    "answer": "resposta do usuário"
  }
  ```
- **Resposta**: 
  ```json
  {
    "job_id": "uuid-do-job",
    "canvas_state": {...}
  }
  ```
- **Erros**:
  - `403`: Canvas não encontrado ou acesso negado

#### `GET /canvas/{canvas_id}/job/{job_id}`
- **Descrição**: Verifica o status de um job de processamento de campo
- **Autenticação**: Bearer Token requerido
- **Parâmetros**:
  - `canvas_id` (path): ID do canvas
  - `job_id` (path): ID do job
- **Resposta**: Objeto `Job` com status do processamento
- **Erros**:
  - `403`: Canvas não encontrado ou acesso negado
  - `404`: Job não encontrado

### Modelos de Dados

#### `Canvas`
```json
{
  "id": "string",
  "name": "string",
  "owner": {
    "id": "string",
    "email": "string"
  },
  "users": [
    {
      "id": "string", 
      "email": "string"
    }
  ],
  "canvas_state": {...}
}
```

#### `CanvasState`
Objeto contendo o estado completo do canvas com os 28 campos do DIP-AI.

#### `FieldAnswer`
```json
{
  "answer": "string"
}
```

#### `Job`
```json
{
  "id": "string",
  "status": "pending|running|completed|failed",
  "created_at": "datetime",
  "completed_at": "datetime|null",
  "error": "string|null"
}
```
