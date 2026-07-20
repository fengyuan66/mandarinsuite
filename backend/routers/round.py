from fastapi import APIRouter, Depends, HTTPException
from routers.characterbank import add_character
from routers.generation import get_characters_in_unit
import json
from routers.ai import ai, safe_ai_json
from data.lookup import lookup_hanzi
from models.character import Character
from pydantic import ValidationError
from sqlmodel import Session, select
from models.round import Round
from database import engine
from models.unit import Unit
from models.user import User
from auth import manager
from routers.mastery import get_weakest_characters
from routers.cohort import create_cohort, cohort_add_character


router = APIRouter()

def discover_themed_characters(theme: str, unit_id: int, count: int = 15) -> list[int]:
    # Scoped to this unit's own rounds rather than every character the user (or anyone)
    # has ever seen — a unit only spans a few rounds, so this stays naturally small,
    # unlike the old global/whole-history exclusion list.
    existing_hanzi_list = get_characters_in_unit(unit_id)
    prompt = f"""Suggest {count} new single Mandarin characters related to the theme "{theme}", suitable for a learner.
    Do NOT include any of these existing characters: {existing_hanzi_list}.
    Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
    """

    candidates = safe_ai_json(prompt)
    print(f"[DEBUG] discover_themed_characters raw candidates: {candidates!r}")
    if not isinstance(candidates, list):
        candidates = []

    new_char_ids = []
    for hanzi in candidates:
        entry = lookup_hanzi(hanzi)
        if entry is None:
            print(f"[DEBUG] discover_themed_characters: '{hanzi}' not found in dictionary, skipped")
            continue
        try:
            character = Character(hanzi = hanzi, **entry)
            saved = add_character(character)
            new_char_ids.append(saved.id)
        except (ValidationError, TypeError) as e:
            print(f"[DEBUG] discover_themed_characters: '{hanzi}' failed validation ({e}), skipped")
            continue
    
    print(f"[DEBUG] discover_themed_characters final new_char_ids: {new_char_ids}")
    return new_char_ids


def create_round(unit_id: int, user_id: int):


    with Session(engine) as session:
        existing_rounds = session.exec(
            select(Round).where(Round.unit_id == unit_id)
        ).all()
        progress = len(existing_rounds) + 1 #PROGRESS OF ROUNDS

        unit = session.get(Unit, unit_id)

    #Character types created here
    review_ids = get_weakest_characters(user_id)
    new_ids = discover_themed_characters(theme = unit.theme, unit_id = unit_id)

    newcohort = create_cohort(user_id = user_id)
    for character_id in (review_ids + new_ids):
        cohort_add_character(newcohort.id, character_id)

    with Session(engine) as session:
        new_round = Round(unit_id=unit_id, cohort_id = newcohort.id, progress=progress, user_id=user_id)
        session.add(new_round)
        session.commit()
        session.refresh(new_round)
        return new_round

@router.post("/round")
def create_round_route(unit_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        unit = session.exec(select(Unit).where(Unit.id == unit_id, Unit.user_id == user.id)).first()
        if unit is None:
            raise HTTPException(404, "Unit not found")
    return create_round(unit_id, user.id)


@router.get("/round/{unit_id}")
def get_round(id: int = None, user: User = Depends(manager)):


    with Session(engine) as session:
        round = session.exec(
            select(Round).where(Round.id == id, Round.user_id == user.id)
        ).first()

    return round

@router.get("/unit/{unit_id}/round/current")
def get_latest_round(unit_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        latest_round = session.exec(
            select(Round)
            .where(Round.unit_id == unit_id, Round.user_id == user.id)
            .order_by(Round.progress.desc())
        ).first()
        return latest_round