from models.character import Character
from sqlmodel import Session, select
from database import engine
from models.round import Round
from models.cohort import Cohort, CohortCharacter
from fastapi import APIRouter


@router.get("/known_hanzi/{unit_id}/{before_progress}")
def get_known_hanzi(unit_id: int, before_progress: int | None = None) -> list[str]:
    with Session(engine) as session:

        conditions = [Round.unit_id == unit_id]
        if before_progress is not None:
            conditions.append(Round.progress < before_progress)

        statement = select(Round).where(*conditions)
        rounds = session.exec(statement).all()

        cohort_ids = [round.cohort_id for round in rounds]

        linkedchars = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id.in_(cohort_ids))
        ).all()
        character_ids = [link.character_id for link in linkedchars]

        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return [character.hanzi for character in characters]
    
def get_known_Characters(unit_id: int, before_progress: int | None = None) -> list[Character]:
    with Session(engine) as session:

        conditions = [Round.unit_id == unit_id]
        if before_progress is not None:
            conditions.append(Round.progress < before_progress)

        statement = select(Round).where(*conditions)
        rounds = session.exec(statement).all()

        cohort_ids = [round.cohort_id for round in rounds]

        linkedchars = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id.in_(cohort_ids))
        ).all()
        character_ids = [link.character_id for link in linkedchars]

        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return [character for character in characters]