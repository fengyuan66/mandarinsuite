from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Round(SQLModel, table = True):
    id: Optional[int] = Field(default = None, primary_key = True)
    unit_id: int = Field(foreign_key = "unit.id")
    cohort_id: int = Field(foreign_key = "cohort.id")
    status: str = Field(default = "cohort_ready")
    created_at: datetime = Field(default_factory=datetime.utcnow)