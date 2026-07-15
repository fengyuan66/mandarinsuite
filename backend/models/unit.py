from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Unit(SQLModel, table=True):
    id: Optional[int] = Field(default= None, primary_key = True)
    theme: str
    target_rounds: int
    status: str = Field(default = "in_progress")
    created_at: datetime = Field(default_factory = datetime.utcnow)
    is_active: bool = Field(default = True)

