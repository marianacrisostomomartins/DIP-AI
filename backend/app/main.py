from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.llm_client import LLMClient
from app.schemas import User, Canvas, CanvasState, FieldAnswer
from app.auth import (
    authenticate_user, get_password_hash, create_access_token, get_current_user
)
from fastapi.security import OAuth2PasswordRequestForm
from app.db.db import get_db, get_db_session_factory
from app.db.models_orm import CanvasORM, UserORM
from app.jobs import job_manager, process_field_update_job, Job
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
import uuid

llm_client = LLMClient()
app = FastAPI(title="DIP-AI API")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:3000",
        "https://dip-ai.vercel.app",  # Frontend em produção
        "https://*.vercel.app"  # Wildcard para outros deploys do Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Rota raiz que retorna informações básicas sobre a API"""
    return {"message": "DIP-AI Canvas API", "version": "0.1.0"}

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
    return True

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

    user_id = str(user_orm.id)
    user_email = user_orm.email

    canvas = CanvasORM(id=canvas_id, name=name, owner_id=current_user.id, canvas_state=canvas_state_dict)
    
    # Adicionar o usuário dono à lista de usuários do canvas
    canvas.users.append(user_orm)
    db.add(canvas)
    await db.commit()
    
    return Canvas(
        id=canvas_id,
        name=name,
        owner=User(id=user_id, email=user_email),
        users=[User(id=user_id, email=user_email)],
        canvas_state=None
    )

@app.delete("/canvas/{canvas_id}")
async def delete_canvas(canvas_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    canvas_orm = await db.get(CanvasORM, canvas_id)
    
    if not canvas_orm:
        raise HTTPException(status_code=404, detail="Canvas não encontrado")
    
    # Verificar se o usuário atual é o dono do canvas
    if str(canvas_orm.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Apenas o proprietário pode deletar o canvas")
    
    # Deletar o canvas
    await db.delete(canvas_orm)
    await db.commit()
    
    return True

@app.put("/canvas/edit/{canvas_id}")
async def edit_canvas(canvas_id: str, name: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    canvas_orm = await db.get(CanvasORM, canvas_id)
    
    if not canvas_orm:
        raise HTTPException(status_code=404, detail="Canvas não encontrado")
    
    # Verificar se o usuário atual é o dono do canvas
    if str(canvas_orm.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Apenas o proprietário pode editar o canvas")
    
    # Verificar se já existe um canvas com o mesmo nome para o usuário (exceto o atual)
    result = await db.execute(
        select(CanvasORM)
        .where(
            CanvasORM.name == name,
            CanvasORM.owner_id == current_user.id,
            CanvasORM.id != canvas_id
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=409, detail=f"Canvas \"{name}\" já existe")
    
    # Atualizar o nome do canvas
    canvas_orm.name = name
    await db.commit()
    
    return True

@app.get("/list_canvas", response_model=List[Canvas])
async def list_canvas(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    canvas_orm = await db.execute(
        select(CanvasORM.id, CanvasORM.name, CanvasORM.owner_id)
        .select_from(CanvasORM)
        .join(CanvasORM.users)
        .where(UserORM.id == current_user.id)
    )
    canvas_orm = canvas_orm.all()
    
    # Para cada canvas, buscar os dados dos usuários e do owner
    canvas_list = []
    for canvas_id, canvas_name, owner_id in canvas_orm:
        # Buscar dados do owner
        owner_user_orm = await db.execute(
            select(UserORM.id, UserORM.email)
            .where(UserORM.id == owner_id)
        )
        owner_user_orm = owner_user_orm.first()
        
        # Buscar dados dos usuários do canvas
        users_orm = await db.execute(
            select(UserORM.id, UserORM.email)
            .select_from(UserORM)
            .join(UserORM.canvas)
            .where(CanvasORM.id == canvas_id)
        )
        users_orm = users_orm.all()
        
        canvas_list.append(Canvas(
            id=str(canvas_id),
            name=canvas_name,
            owner=User(id=str(owner_user_orm[0]), email=owner_user_orm[1]),
            users=[User(id=str(user_id), email=user_email) for user_id, user_email in users_orm],
            canvas_state={}
        ))
    
    return canvas_list

@app.post("/canvas/invite/{canvas_id}")
async def invite_user(canvas_id: str, email: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    canvas_orm = await db.execute(
        select(CanvasORM)
        .options(selectinload(CanvasORM.users))
        .where(CanvasORM.id == canvas_id)
    )
    canvas_orm = canvas_orm.scalars().first()
    
    if not canvas_orm or str(canvas_orm.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="O usuário não tem permissão para convidar outros usuários para este canvas")
    
    user_orm = await db.execute(select(UserORM).where(UserORM.email == email))
    user_orm = user_orm.scalars().first()
    if not user_orm:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if str(user_orm.id) not in [str(u.id) for u in canvas_orm.users]:
        canvas_orm.users.append(user_orm)
        await db.commit()
    else:
        raise HTTPException(status_code=403, detail="Usuário já possui acesso")
    return True

@app.get("/canvas/state/{canvas_id}")
async def get_canvas_state(canvas_id: str, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    canvas_data = await db.execute(
        select(CanvasORM.canvas_state, CanvasORM.name)
        .select_from(CanvasORM)
        .join(CanvasORM.users)
        .where(CanvasORM.id == canvas_id, UserORM.id == current_user.id)
    )
    canvas_data = canvas_data.first()

    if canvas_data is None:
        raise HTTPException(status_code=403, detail="Canvas não encontrado ou acesso negado")
    
    canvas_state, canvas_name = canvas_data
    canvas_state = CanvasState(**canvas_state)
    
    return {
        "name": canvas_name,
        "canvas_state": canvas_state
    }

@app.post("/canvas/{canvas_id}/field/{field_id}/sync")
async def update_field_answer(canvas_id: str, field_id: int, field_answer: FieldAnswer, current_user: User = Depends(get_current_user), db=Depends(get_db)) -> CanvasState:
    canvas_orm = await db.execute(
        select(CanvasORM)
        .join(CanvasORM.users)
        .where(CanvasORM.id == canvas_id, UserORM.id == current_user.id)
    )
    canvas_orm = canvas_orm.scalar_one_or_none()
    if canvas_orm is None:
        raise HTTPException(status_code=403, detail="Canvas não encontrado ou acesso negado")

    # Criar instância do CanvasState com o estado atual
    canvas_state = CanvasState(**canvas_orm.canvas_state)
    canvas_name = canvas_orm.name

    # Atualizar a resposta do campo
    canvas_state.set_field_answer(field_id, field_answer.answer)

    # Atualizar as sugestões usando o LLM
    await canvas_state.update_suggestions(llm_client)
    
    # Persistir as alterações no banco de dados
    canvas_orm.canvas_state = canvas_state.model_dump()
    await db.commit()
    
    # Retornar o estado atualizado do canvas
    return {
        "name": canvas_name,
        "canvas_state": canvas_state
    }

@app.post("/canvas/{canvas_id}/field/{field_id}")
async def update_field_answer_async(
    canvas_id: str,
    field_id: int,
    field_answer: FieldAnswer,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    canvas_orm = await db.execute(
        select(CanvasORM)
        .join(CanvasORM.users)
        .where(CanvasORM.id == canvas_id, UserORM.id == current_user.id)
    )
    canvas_orm = canvas_orm.scalar_one_or_none()
    if canvas_orm is None:
        raise HTTPException(status_code=403, detail="Canvas não encontrado ou acesso negado")

    # Atualizar apenas a resposta do campo imediatamente (sem LLM)
    canvas_state = CanvasState(**canvas_orm.canvas_state)
    canvas_name = canvas_orm.name
    canvas_state.set_field_answer(field_id, field_answer.answer)
    canvas_orm.canvas_state = canvas_state.model_dump()
    await db.commit()

    # Criar job para processamento das sugestões em background
    job_id = job_manager.create_job()
    
    # Adicionar tarefa em background para processar sugestões do LLM
    background_tasks.add_task(
        process_field_update_job,
        canvas_id,
        field_id,
        field_answer.answer,
        job_id,
        llm_client,
        get_db_session_factory()
    )
    
    return {
        "job_id": job_id,
        "name": canvas_name,
        "canvas_state": canvas_state
    }

@app.get("/canvas/{canvas_id}/job/{job_id}")
async def get_field_update_job_status(
    canvas_id: str,
    job_id: str,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
) -> Job:
    canvas_orm = await db.execute(
        select(CanvasORM)
        .join(CanvasORM.users)
        .where(CanvasORM.id == canvas_id, UserORM.id == current_user.id)
    )
    canvas_orm = canvas_orm.scalar_one_or_none()
    if canvas_orm is None:
        raise HTTPException(status_code=403, detail="Canvas não encontrado ou acesso negado")

    job = job_manager.get_job(str(job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    return job
