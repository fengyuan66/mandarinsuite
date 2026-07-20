from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import engine
from models.character import Character
from models.cohort import Cohort, CohortCharacter
from routers.cohort import create_cohort, cohort_add_character
from models.user import User
from auth import manager
from data.lookup import lookup_hanzi

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

@router.post("/characterbank/lookup")
def lookup_characters(hanzi_list: list[str], user: User = Depends(manager)):
    with Session(engine) as session:
        results = {}
        cohort = None
        for hanzi in hanzi_list:
            existing = session.exec(select(Character).where(Character.hanzi == hanzi)).first()
            if existing:
                character = existing
            else:
                entry = lookup_hanzi(hanzi)
                if entry is None:
                    results[hanzi] = None
                    continue

                character = Character(hanzi=hanzi, **entry)
                session.add(character)
                session.commit()
                session.refresh(character)

            # Looked-up characters (from the universal dictionary in data/) still need
            # to be linked into this user's own characterbank via a cohort, same as
            # AI-discovered characters are.
            if cohort is None:
                cohort = create_cohort(user_id=user.id, active=False)
            cohort_add_character(cohort.id, character.id)
            # Snapshot now: session.commit() on a later iteration expires every object
            # this session has touched, so a live ORM reference here can end up
            # serializing as {} once the session closes and this object hasn't been the
            # most recently committed one.
            results[hanzi] = character.model_dump()

        return results

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

def get_hanzi(user_id: int) -> list[str]:
    with Session(engine) as session:
        return session.exec(
            select(Character.hanzi)
            .join(CohortCharacter, CohortCharacter.character_id == Character.id)
            .join(Cohort, Cohort.id == CohortCharacter.cohort_id)
            .where(Cohort.user_id == user_id)
            .distinct()
        ).all()
