from sqlalchemy import Column, String, Table, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from db import Base

class UserORM(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    reports = relationship("ReportORM", secondary="user_reports", back_populates="users")

class ReportORM(Base):
    __tablename__ = "reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    canvas_state = Column(Text, default="{}")  # Armazena JSON como string
    users = relationship("UserORM", secondary="user_reports", back_populates="reports")

user_reports = Table(
    "user_reports",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id")),
    Column("report_id", UUID(as_uuid=True), ForeignKey("reports.id")),
)
