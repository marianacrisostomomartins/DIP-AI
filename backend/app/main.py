from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Dict, Optional
from .state import CanvasState
from .llm_client import LLMClient

app = FastAPI(title="DIP-AI API")

# Gerenciamento de múltiplos usuários
user_canvas_states: Dict[str, CanvasState] = {}
llm_client = LLMClient()

class FieldAnswer(BaseModel):
    answer: str

# Função utilitária para obter o estado do canvas do usuário
def get_user_canvas_state(user_id: str) -> CanvasState:
    if user_id not in user_canvas_states:
        user_canvas_states[user_id] = CanvasState()
    return user_canvas_states[user_id]

@app.get("/")
async def root():
    """Rota raiz que retorna informações básicas sobre a API"""
    return {"message": "DIP-AI Canvas API", "version": "0.1.0"}

@app.get("/canvas")
async def get_canvas(user_id: str = Header(...)) -> Dict:
    """Retorna o estado atual do canvas do usuário"""
    canvas_state = get_user_canvas_state(user_id)
    return canvas_state.get_canvas()

@app.post("/canvas/field/{field_id}")
async def update_field_answer(field_id: int, field_answer: FieldAnswer, user_id: str = Header(...)) -> Dict:
    """
    Atualiza a resposta de um campo específico e retorna o estado atualizado do canvas do usuário
    
    Args:
        field_id: ID do campo a ser atualizado
        field_answer: Objeto contendo a nova resposta para o campo
    
    Returns:
        Dict: Estado atualizado do canvas e possível erro de sugestão
    
    Raises:
        HTTPException: Se o campo não for encontrado
    """
    canvas_state = get_user_canvas_state(user_id)
    try:
        # Atualiza a resposta do campo
        canvas_state.set_field_answer(field_id, field_answer.answer)
        
        # Atualiza as sugestões usando o LLM
        await canvas_state.update_suggestions(llm_client)
        
        # Retorna o estado atualizado do canvas e o erro de sugestão, se houver
        return {
            "canvas": canvas_state.get_canvas(),
            "suggestion_error": canvas_state.suggestion_error
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
