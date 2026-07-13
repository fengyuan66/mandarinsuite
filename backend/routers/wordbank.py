from fastapi import APIRouter
from sqlmodel import Session, select
from database import engine
from models.word import Word

router = APIRouter()

# Wordbank Database 
@router.post("/wordbank")
def add_word(word: Word):
    db_word = Word.model_validate(word)
    with Session(engine) as session:
        session.add(word) #teacher takes notebook from Sam
        session.commit() #teacher gives notebook to principal
        #principal slaps on sticker to notebook
        #Sam: "teacher! May I see my notebook again?"
        session.refresh(word) #Sam/teacher needs to see the notebook again to see the sticker because it was updated by the principal
        return word #Sam sees the notebook + sticker

@router.get("/wordbank")
def get_word():
    with Session(engine) as session:
        words = session.exec(select(Word)).all()
        return words

def get_hanzi() -> list[str]:
    with Session(engine) as session:
        return session.exec(select(Word.hanzi)).all()