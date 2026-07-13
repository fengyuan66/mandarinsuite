from sqlmodel import SQLModel, Field
from typing import Optional

# Wordbank Database Model:

class WordBase(SQLModel):
    
    hanzi: str
    pinyin: str
    meaning: str
    strokec: int

class Word(WordBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)