from typing import List, Dict
from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str
    hashed_password: str
    canvas: List[str] = []  # Lista de IDs de canvas

class Canvas(BaseModel):
    id: str
    name: str
    owner_id: str
    user_ids: List[str]  # IDs dos usuários com acesso
    canvas_state: Dict  # Estado do canvas (pode ser ajustado conforme necessário)
