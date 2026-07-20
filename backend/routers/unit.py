from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import engine
from models.unit import Unit
from models.round import Round
from models.cohort import Cohort
from routers.cohort import deactivate_all_cohorts
from routers.ai import ai
from routers.round import create_round
import json
import random
from models.user import User
from auth import manager

router = APIRouter()

def safe_ai_json(prompt, model: str = "openai/gpt-oss-120b"):
    """Returns the AI's parsed JSON, or None if generation/parsing failed."""
    try:
        text = ai(prompt, model)
    except Exception:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None

def deactivate_all_units(session: Session, user_id: int):

    active_units = session.exec(select(Unit).where(Unit.is_active==True, Unit.user_id==user_id))
    for unit in active_units:
        unit.is_active = False
        session.add(unit)

@router.patch("/unit/{unit_id}/activate")
def activate_unit(unit_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        deactivate_all_units(session, user.id)
        unit = session.exec(select(Unit).where(Unit.id == unit_id, Unit.user_id == user.id)).first()
        unit.is_active = True
        session.add(unit)

        latest_round = session.exec(
            select(Round)
            .where(Round.unit_id == unit_id, Round.user_id == user.id)
            .order_by(Round.progress.desc())
        ).first()

        if latest_round is not None:
            deactivate_all_cohorts(session, user.id)
            cohort = session.get(Cohort, latest_round.cohort_id)
            if cohort is not None:
                cohort.is_active = True
                session.add(cohort)

        session.commit()
        session.refresh(unit)
        return unit

@router.get("/unit/all")
def get_all_units(user: User = Depends(manager)):
    with Session(engine) as session:
        units = session.exec(select(Unit).where(Unit.user_id == user.id)).all()
        return units
    

        
@router.get("/unit/active")
def get_active_unit(user: User = Depends(manager)):
    with Session(engine) as session:
        active_unit = session.exec(
            select(Unit).where(Unit.is_active == True, Unit.user_id == user.id)
        ).first()
        return active_unit

@router.get("/unit/{unit_id}")
def get_unit(unit_id, user: User = Depends(manager)):
    with Session(engine) as session:
        
        unit = session.exec(select(Unit).where(Unit.id == unit_id, Unit.user_id == user.id)).first()
        return unit

@router.post("/unit")
def create_unit(themechosen: str = None, roundcount: int = None, user: User = Depends(manager)):

    if (themechosen is None and roundcount is None):
        
        existing_themes = []
        with Session(engine) as session:
            existing_units = session.exec(select(Unit).where(Unit.user_id == user.id)).all()
            existing_themes = [unit.theme for unit in existing_units]

        prompt = f"""Invent a learning theme for a Mandarin vocabulary unit
        (e.g. "family", "food", "travel").
        Do not choose any of these existing themes:
        {existing_themes}
        Choose a reasonable number of study rounds between 3 and 6.
        Respond with ONLY a JSON object, no other text, in this exact format:
        {{"theme": "food", "target_rounds": 4}}
        """
        response = safe_ai_json(prompt) or {}
        theme = response.get("theme") or random.choice(["family", "food", "travel", "daily life", "hobbies"])
        target_rounds = response.get("target_rounds") or 4

        with Session(engine) as session:
            deactivate_all_units(session, user.id)
            new_unit = Unit(theme = theme, target_rounds = target_rounds, user_id = user.id)
            session.add(new_unit)
            session.commit()
            session.refresh(new_unit)
            create_round(unit_id = new_unit.id, user_id = user.id)
            return new_unit
    
    else:
        with Session(engine) as session:
            deactivate_all_units(session, user.id)
            new_unit = Unit(theme = themechosen, target_rounds = roundcount, user_id = user.id)
            session.add(new_unit)
            session.commit()
            session.refresh(new_unit)
            create_round(unit_id = new_unit.id, user_id = user.id)
            return new_unit
    