from pydantic import BaseModel

from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional

class Word(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hanzi: str
    pinyin: str
    meaning: str
    strokec: int

sqlite_url = "sqlite:///./mandarinsuite.db"
engine = create_engine(sqlite_url)

SQLModel.metadata.create_all(engine)

