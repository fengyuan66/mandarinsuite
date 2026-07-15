from models.character import Character
from sqlmodel import Session, select
from database import engine
from models.round import Round
from models.cohort import Cohort, CohortCharacter
from fastapi import APIRouter
from models.unit import Unit
from routers.ai import ai
import json

router = APIRouter()

@router.get("/generation/known_hanzi/{unit_id}/{before_progress}")
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
    
def get_characters_in_unit(unit_id: int) -> list[str]:
    with Session(engine) as session:
       
        statement = select(Round).where(Round.unit_id == unit_id)
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
    
    
def get_characters_in_round(round_id: int) -> list[str]:
    with Session(engine) as session:
       
        statement = select(Round).where(Round.id == round_id)
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


@router.post("/generation/writing-dication/{round_id}")
def generate_writing_dictation(round_id: int):
    with Session(engine) as session:
        round = session.get(Round, round_id).first()
        unit = session.get(Unit, round.unit_id).first()
    
    allowlist = get_known_hanzi(round.unit_id, before_progress=round.progress)
    if len(allowlist) < 30:
        return {"skipped": True, "reason": "not enough known vocab yet!"}
    
    prompt = f"""Write a short ~100 word paragraph in Mandarin, themed around "{unit.theme}".
You may ONLY use these characters, no others: {allowlist}
Respond with ONLY the paragraph text, no other commentary.
"""
    
    paragraph = ai(prompt)
    return {"skipped": False, "paragraph": paragraph}

@router.post("/generation/fib/{round_id}")
def generate_fib(round_id: int):
    allowlist = get_characters_in_round(round_id)

    prompt = f"""Write one natural Mandarin sentence that uses some of these characters: {allowlist}.
Then remove those characters from the sentence, replacing each with a blank ___.
Respond with ONLY a JSON object, no other text, in this exact format:
{{"sentence_with_blanks": "...", "answers": ["...", "..."]}}
"""
    result = json.loads(ai(prompt))
    return result


@router.post("/generation/unit_review/{unit_id}")
def generate_unit_review(unit_id: int):
    with Session(engine) as session:
        unit = session.get(Unit, unit_id)
        allowlist = get_characters_in_unit(unit_id)
        paragraph_prompt = f"""Write a short ~100 word paragraph in Mandarin, themed around "{unit.theme}".
You may ONLY use these characters, no others: {allowlist}
Respond with ONLY the paragraph text, no other commentary.
"""
        paragraph = ai(paragraph_prompt)

        fib_prompt = f"""Write one natural Mandarin sentence that uses some of these characters: {known_hanzi}.
Then remove those characters from the sentence, replacing each with a blank ___.
Respond with ONLY a JSON object, no other text, in this exact format:
{{"sentence_with_blanks": "...", "answers": ["...", "..."]}}
"""
        fib_result = json.loads(ai(fib_prompt))

        return{
            "allowlist": allowlist,
            "paragraph": paragraph,
            "fib": fib_result,
        }
    

@router.post("/generation/free-write/{unit_id}")
def generate_free_write(unit_id: int):
    allowlist = get_characters_in_unit(unit_id)
    prompt = f"""Write a short, friendly writing prompt in English that would naturally lead a Mandarin learner
to write a ~100 word response using vocabulary they know. They know these characters: {allowlist}.
Respond with ONLY the prompt text, no other commentary.
"""
    return {"prompt": ai(prompt)}


@router.patch("/round/{round_id}/status")
def advance_round_status(round_id: int, new_status: str):
    with Session(engine) as session:
        round = session.get(Round, round_id)
        round.status = new_status
        session.add(round)
        session.commit()
        session.refresh(round)
        return round
    
    