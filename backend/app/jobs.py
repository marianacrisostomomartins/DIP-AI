import uuid
from typing import Dict, Optional
from enum import Enum
from pydantic import BaseModel
from datetime import datetime, timedelta
import asyncio


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running" 
    COMPLETED = "completed"
    FAILED = "failed"


class Job(BaseModel):
    id: str
    status: JobStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


class JobManager:
    def __init__(self, job_retention_minutes: int = 30):
        self.jobs: Dict[str, Job] = {}
        self.job_retention_minutes = job_retention_minutes
    
    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id,
            status=JobStatus.PENDING,
            created_at=datetime.now()
        )
        self.jobs[job_id] = job
        return job_id
    
    def get_job(self, job_id: str) -> Optional[Job]:
        # Limpar jobs expirados antes de buscar
        self._cleanup_expired_jobs()
        return self.jobs.get(job_id)
    
    def update_job_status(self, job_id: str, status: JobStatus, result: Optional[dict] = None, error: Optional[str] = None):
        if job_id in self.jobs:
            job = self.jobs[job_id]
            job.status = status
            if status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                job.completed_at = datetime.now()
            if result:
                job.result = result
            if error:
                job.error = error
    
    def _cleanup_expired_jobs(self):
        """Remove jobs que expiraram baseado no tempo de retenção"""
        current_time = datetime.now()
        expired_job_ids = []
        
        for job_id, job in self.jobs.items():
            # Calcula o tempo de vida do job
            if job.completed_at:
                # Para jobs finalizados, usar completed_at como base
                job_age = current_time - job.completed_at
            else:
                # Para jobs ainda em execução, usar created_at como base
                job_age = current_time - job.created_at
            
            # Se o job é mais antigo que o tempo de retenção, marcar para remoção
            if job_age > timedelta(minutes=self.job_retention_minutes):
                expired_job_ids.append(job_id)
        
        # Remover jobs expirados
        for job_id in expired_job_ids:
            del self.jobs[job_id]
    
    def get_job_count(self) -> int:
        """Retorna o número atual de jobs em memória"""
        self._cleanup_expired_jobs()
        return len(self.jobs)
    
    def cleanup_all_jobs(self):
        """Remove todos os jobs (útil para testes ou reinicialização)"""
        self.jobs.clear()


job_manager = JobManager(job_retention_minutes=5)


async def process_field_update_job(canvas_id: str, field_id: int, answer: str, job_id: str, llm_client, db_session_factory):
    """Processa a atualização de campo em background"""
    from app.db.models_orm import CanvasORM
    from app.schemas.state import CanvasState
    from sqlalchemy.future import select
    
    try:
        job_manager.update_job_status(job_id, JobStatus.RUNNING)
        
        # Criar nova sessão para este job
        async with db_session_factory() as db:
            # Buscar o canvas
            canvas_orm = await db.execute(
                select(CanvasORM).where(CanvasORM.id == canvas_id)
            )
            canvas_orm = canvas_orm.scalar_one_or_none()
            
            if canvas_orm is None:
                raise Exception("Canvas não encontrado")

            # Criar instância do CanvasState com o estado atual
            canvas_state = CanvasState(**canvas_orm.canvas_state)

            # Atualizar a resposta do campo
            canvas_state.set_field_answer(field_id, answer)

            # Atualizar as sugestões usando o LLM
            await canvas_state.update_suggestions(llm_client)
            
            # Persistir as alterações no banco de dados
            canvas_orm.canvas_state = canvas_state.model_dump()
            await db.commit()
            
            # Marcar job como concluído
            job_manager.update_job_status(
                job_id,
                JobStatus.COMPLETED
            )
            
    except Exception as e:
        job_manager.update_job_status(job_id, JobStatus.FAILED, error=str(e))
