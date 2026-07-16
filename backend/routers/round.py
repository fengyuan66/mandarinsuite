from fastapi import APIRouter
from routers.characterbank import get_hanzi, add_character
import json
from routers.ai import ai
from data.lookup import lookup_hanzi
from models.character import Character
from pydantic import ValidationError
from sqlmodel import Session, select
from models.round import Round
from database import engine
from models.unit import Unit
from routers.mastery import get_weakest_characters
from routers.cohort import create_cohort, cohort_add_character


router = APIRouter()

def discover_themed_characters(theme: str, count: int = 15) -> list[int]:
    existing_hanzi_list = get_hanzi()
    prompt = f"""Suggest {count} new single Mandarin characters related to the theme "{theme}", suitable for a learner.
    Do NOT include any of these existing characters: {existing_hanzi_list}.
    Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
    """

    candidates = json.loads(ai(prompt))

    new_char_ids = []
    for hanzi in candidates:
        entry = lookup_hanzi(hanzi)
        if entry is None:
            continue
        try:
            character = Character(hanzi = hanzi, **entry)
            saved = add_character(character)
            new_char_ids.append(saved.id)
        except (ValidationError, TypeError):
            continue
    
    return new_char_ids


@router.post("/round")
def create_round(unit_id: int):
    
    
    with Session(engine) as session:
        existing_rounds = session.exec(
            select(Round).where(Round.unit_id == unit_id)
        ).all()
        progress = len(existing_rounds) + 1 #PROGRESS OF ROUNDS
    
        unit = session.get(Unit, unit_id)

    #Character types created here
    review_ids = get_weakest_characters()
    new_ids = discover_themed_characters(theme = unit.theme)       

    newcohort = create_cohort()
    for character_id in (review_ids + new_ids):
        cohort_add_character(newcohort.id, character_id)

    with Session(engine) as session:
        new_round = Round(unit_id=unit_id, cohort_id = newcohort.id, progress=progress)
        session.add(new_round)
        session.commit()
        session.refresh(new_round)
        return new_round
    


@router.get("/round/{unit_id}")
def get_round(id: int = None):
    


    with Session(engine) as session:
        round = session.exec(
            select(Round).where(Round.id == id)
        ).first()

    return round
    
@router.get("/unit/{unit_id}/round/current")
def get_latest_round(unit_id: int):
    with Session(engine) as session:
        latest_round = session.exec(
            select(Round)
            .where(Round.unit_id == unit_id)
            .order_by(Round.progress.desc())
        ).first()
        return latest_round