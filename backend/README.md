# DIP‑AI Interview Backend

Esta aplicação implementa um backend em Python (FastAPI) para conduzir entrevistas via LLM, auxiliando o usuário a preencher um Canvas de 28 campos (DIP‑AI). Usa Ollama como provedor de LLM e orquestra a lógica de perguntas/respostas com LangGraph.

## Estrutura do projeto

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
python3 db/init_db.py
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

## Como testar

```bash
pytest
```
