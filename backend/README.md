# DIP‑AI Interview Backend

Esta aplicação implementa um backend em Python (FastAPI) para conduzir entrevistas via LLM, auxiliando o usuário a preencher um Canvas de 28 campos (DIP‑AI). Usa Ollama como provedor de LLM e orquestra a lógica de perguntas/respostas com LangGraph.

## Estrutura do projeto

- `app/main.py`: servidor FastAPI com rotas REST e WebSocket.
- `app/state.py`: modelos Pydantic para Canvas e estado.
- `app/llm_client.py`: cliente Ollama HTTP.
- `app/prompts/update_sugestions`: prompt para atualizar as sugestões de resposta e pergunta.
- `requirements.txt`: dependências.

## Como executar

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Como testar

```bash
pytest
```
