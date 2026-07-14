from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Cohort(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

class CohortCharacter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cohort_id: int = Field(foreign_key="cohort.id")
    character_id: int = Field(foreign_key="character.id")