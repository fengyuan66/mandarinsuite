from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

#PracticeEntry is a connected database of PracticeLog. One PracticeLog can have many PracticeEntries.
#They are linked purely(?) by session_id: int = Field(foreign_key = "practicelog.id")

class PracticeLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    session_time: datetime = Field(default_factory=datetime.utcnow)
class PracticeEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key = "practicelog.id")
    character_id: int = Field (foreign_key = "character.id")
    times_written: int