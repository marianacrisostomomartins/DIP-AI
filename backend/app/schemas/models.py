from typing import List, Dict, Optional
from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str

class Canvas(BaseModel):
    id: str
    name: str
    owner: Optional[User]  # Dono do canvas
    users: Optional[List[User]]  # Lista de usuários com acesso
    canvas_state: Optional[Dict]  # Estado do canvas

class FieldAnswer(BaseModel):
    answer: str