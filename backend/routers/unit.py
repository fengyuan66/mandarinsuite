from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import engine
from models.unit import Unit
from routers.ai import ai
from routers.round import create_round
import json
from models.user import User
from auth import manager

router = APIRouter()

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
        response = json.loads(ai(prompt))

        with Session(engine) as session:
            deactivate_all_units(session, user.id)
            new_unit = Unit(theme = response["theme"], target_rounds = response["target_rounds"], user_id = user.id)
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
    