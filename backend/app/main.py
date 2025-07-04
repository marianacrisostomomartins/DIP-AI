from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Dict, List
from app.llm_client import LLMClient
from app.schemas import User, Canvas, CanvasState
from app.auth import (
    authenticate_user, get_password_hash, create_access_token, get_current_user
)
from fastapi.security import OAuth2PasswordRequestForm
from app.db.db import get_db
from app.db.models_orm import CanvasORM, UserORM
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
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


@app.post("/canvas/field/{field_id}")
async def update_field_answer(field_id: int, field_answer: FieldAnswer, current_user: User = Depends(get_current_user)) -> Dict:
    """
    Atualiza a resposta de um campo específico e retorna o estado atualizado do canvas do usuário autenticado
    
    Args:
        field_id: ID do campo a ser atualizado
        field_answer: Objeto contendo a nova resposta para o campo
    
    Returns:
        Dict: Estado atualizado do canvas e possível erro de sugestão
    
    Raises:
        HTTPException: Se o campo não for encontrado
    """
    canvas_state = get_user_canvas_state(str(current_user.id))
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
async def register(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    result = await db.execute(select(UserORM).where(UserORM.email == form_data.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email já registrado")
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(form_data.password)
    user = UserORM(id=user_id, email=form_data.username, hashed_password=hashed_password)
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao registrar usuário")
    return {"msg": "Usuário registrado com sucesso"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=400, detail="Email ou senha incorretos")
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/create_canvas", response_model=Canvas)
async def create_canvas(name: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    # Verificar se já existe um canvas com o mesmo nome para o usuário
    result = await db.execute(select(CanvasORM).where(CanvasORM.name == name, CanvasORM.owner_id == current_user.id))
    if result.scalars().first():
        raise HTTPException(status_code=409, detail=f"Canvas \"{name}\" já existe")

    canvas_id = str(uuid.uuid4())

    # Criar o estado inicial do canvas
    initial_canvas_state = CanvasState()
    canvas_state_dict = initial_canvas_state.model_dump()

    # Obter o usuário completo do banco
    user_orm = await db.get(UserORM, current_user.id)
    if not user_orm:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    canvas = CanvasORM(id=canvas_id, name=name, owner_id=current_user.id, canvas_state=canvas_state_dict)
    
    # Adicionar o usuário dono à lista de usuários do canvas
    canvas.users.append(user_orm)
    
    db.add(canvas)
    await db.commit()
    
    # Recarregar o canvas com os usuários para evitar lazy loading
    result = await db.execute(
        select(CanvasORM)
        .options(selectinload(CanvasORM.users))
        .where(CanvasORM.id == canvas_id)
    )
    canvas_with_users = result.scalars().first()
    
    return Canvas(
        id=str(canvas_with_users.id),
        name=canvas_with_users.name,
        owner_id=str(canvas_with_users.owner_id),
        user_ids=[str(u.id) for u in canvas_with_users.users],
        canvas_state=canvas_with_users.canvas_state or {}
    )

@app.get("/list_canvas", response_model=List[Canvas])
async def list_canvas(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    # Buscar o usuário com seus canvas e os usuários de cada canvas
    result = await db.execute(
        select(UserORM)
        .options(selectinload(UserORM.canvas).selectinload(CanvasORM.users))
        .where(UserORM.id == current_user.id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return [
        Canvas(
            id=str(canvas.id),
            name=canvas.name,
            owner_id=str(canvas.owner_id),
            user_ids=[str(u.id) for u in canvas.users],
            canvas_state=canvas.canvas_state or {}
        ) for canvas in user.canvas
    ]

@app.get("/reports/{report_id}", response_model=Canvas)
async def get_report(report_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    # Buscar o report com os usuários carregados
    result = await db.execute(
        select(CanvasORM)
        .options(selectinload(CanvasORM.users))
        .where(CanvasORM.id == report_id)
    )
    report = result.scalars().first()
    
    if not report or current_user.id not in [u.id for u in report.users]:
        raise HTTPException(status_code=404, detail="Relatório não encontrado ou acesso negado")
    
    return Canvas(
        id=str(report.id),
        name=report.name,
        owner_id=str(report.owner_id),
        user_ids=[str(u.id) for u in report.users],
        canvas_state=report.canvas_state or {}
    )

@app.post("/reports/{report_id}/invite")
async def invite_user(report_id: str, email: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    report = await db.get(CanvasORM, report_id)
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
    report = await db.get(CanvasORM, report_id)
    if not report or current_user.id not in [u.id for u in report.users]:
        raise HTTPException(status_code=404, detail="Relatório não encontrado ou acesso negado")
    report.canvas_state = str(canvas)
    await db.commit()
    return {"msg": "Canvas atualizado"}
