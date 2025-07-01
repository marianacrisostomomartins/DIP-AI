from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Dict, List
from state import CanvasState
from llm_client import LLMClient
from schemas.models import User, Report
from auth import (
    authenticate_user, get_password_hash, create_access_token, get_current_user, fake_users_db
)
from fastapi.security import OAuth2PasswordRequestForm
from .db.db import get_db
from .db.models_orm import ReportORM, UserORM
from sqlalchemy.future import select
import uuid

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

@app.post("/register")
async def register(form_data: OAuth2PasswordRequestForm = Depends()):
    if any(u.email == form_data.username for u in fake_users_db.values()):
        raise HTTPException(status_code=400, detail="Email já registrado")
    user_id = str(uuid.uuid4())
    user = User(id=user_id, email=form_data.username, hashed_password=get_password_hash(form_data.password))
    fake_users_db[user_id] = user
    return {"msg": "Usuário registrado com sucesso"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Email ou senha incorretos")
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/reports", response_model=Report)
async def create_report(name: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    report_id = str(uuid.uuid4())
    report = ReportORM(id=report_id, name=name, owner_id=current_user.id, canvas_state="{}")
    db.add(report)
    await db.commit()
    await db.refresh(report)
    # Adiciona o usuário ao relatório
    user = await db.get(UserORM, current_user.id)
    if user:
        user.reports.append(report)
        await db.commit()
    return Report(
        id=report.id,
        name=report.name,
        owner_id=report.owner_id,
        user_ids=[u.id for u in report.users],
        canvas_state={}
    )

@app.get("/reports", response_model=List[Report])
async def list_reports(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    user = await db.get(UserORM, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return [
        Report(
            id=report.id,
            name=report.name,
            owner_id=report.owner_id,
            user_ids=[u.id for u in report.users],
            canvas_state={}
        ) for report in user.reports
    ]

@app.get("/reports/{report_id}", response_model=Report)
async def get_report(report_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    report = await db.get(ReportORM, report_id)
    if not report or current_user.id not in [u.id for u in report.users]:
        raise HTTPException(status_code=404, detail="Relatório não encontrado ou acesso negado")
    return Report(
        id=report.id,
        name=report.name,
        owner_id=report.owner_id,
        user_ids=[u.id for u in report.users],
        canvas_state={}
    )

@app.post("/reports/{report_id}/invite")
async def invite_user(report_id: str, email: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    report = await db.get(ReportORM, report_id)
    if not report or report.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o owner pode convidar")
    user = await db.execute(select(UserORM).where(UserORM.email == email))
    user = user.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if user not in report.users:
        report.users.append(user)
        await db.commit()
    return {"msg": f"Usuário {email} adicionado ao relatório"}

@app.post("/reports/{report_id}/canvas")
async def update_report_canvas(report_id: str, canvas: Dict, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    report = await db.get(ReportORM, report_id)
    if not report or current_user.id not in [u.id for u in report.users]:
        raise HTTPException(status_code=404, detail="Relatório não encontrado ou acesso negado")
    report.canvas_state = str(canvas)
    await db.commit()
    return {"msg": "Canvas atualizado"}
