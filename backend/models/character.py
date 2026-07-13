from sqlmodel import SQLModel, Field
from typing import Optional

# Characterbank Database Model:

class CharacterBase(SQLModel):

    hanzi: str
    pinyin: str
    meaning: str
    strokec: int

class Character(CharacterBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
