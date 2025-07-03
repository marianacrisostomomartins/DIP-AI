from sqlalchemy import Column, String, Table, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from app.db.db import Base

class UserORM(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    canvas = relationship("CanvasORM", secondary="user_canvas", back_populates="users")

class CanvasORM(Base):
    __tablename__ = "canvas"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    canvas_state = Column(JSONB, default=dict)
    users = relationship("UserORM", secondary="user_canvas", back_populates="canvas")

user_canvas = Table(
    "user_canvas",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id")),
    Column("canvas_id", UUID(as_uuid=True), ForeignKey("canvas.id")),
)
