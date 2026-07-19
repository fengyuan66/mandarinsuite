from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import engine
from models.character import Character
from models.cohort import Cohort, CohortCharacter
from routers.cohort import create_cohort, cohort_add_character
from models.user import User
from auth import manager

router = APIRouter()

# Characterbank Database
@router.post("/characterbank")
def add_character(character: Character, user: User = Depends(manager)):
    db_character = Character.model_validate(character)
    with Session(engine) as session:
        session.add(character) #teacher takes notebook from Sam
        session.commit() #teacher gives notebook to principal
        #principal slaps on sticker to notebook
        #Sam: "teacher! May I see my notebook again?"
        session.refresh(character) #Sam/teacher needs to see the notebook again to see the sticker because it was updated by the principal
        return character #Sam sees the notebook + sticker
    

@router.get("/characterbank")
def get_character(user: User = Depends(manager)):
    with Session(engine) as session:
        characters = session.exec(
            select(Character)
            .join(CohortCharacter, CohortCharacter.character_id == Character.id)
            .join(Cohort, Cohort.id == CohortCharacter.cohort_id)
            .where(Cohort.user_id == user.id)
            .distinct()
        ).all()
        return characters

def get_hanzi() -> list[str]:
    with Session(engine) as session:
        return session.exec(select(Character.hanzi)).all()
