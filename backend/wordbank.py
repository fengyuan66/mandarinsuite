from pydantic import BaseModel

from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional

# Wordbank Database Model:

class Word(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hanzi: str
    pinyin: str
    meaning: str
    strokec: int


# Wordbank Database Engine:
sqlite_url = "sqlite:///./mandarinsuite.db"
engine = create_engine(sqlite_url)

SQLModel.metadata.create_all(engine)

# Wordbank Database 

def add_word(word: Word):
    with Session(engine) as session:
        session.add(word) #teacher takes notebook from Sam
        session.commit() #teacher gives notebook to principal
        #principal slaps on sticker to notebook
        #Sam: "teacher! May I see my notebook again?"
        session.refresh(word) #Sam/teacher needs to see the notebook again to see the sticker because it was updated by the principal
        return word #Sam sees the notebook + sticker
    
def get_word():
    with Session(engine) as Session:
        words = session.exec(select(Word)).all()
        return words
    