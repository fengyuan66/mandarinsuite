from fastapi import APIRouter
from sqlmodel import Session, select
from database import engine
from models.unit import Unit
from routers.ai import ai
import json

router = APIRouter()

def deactivate_all_units(session: Session):
    active_units = session.exec(select(Unit).where(Unit.is_active==True))
    for unit in active_units:
        unit.is_active = False
        session.add(unit)

@router.patch("/unit/{unit_id}/activate")
def activate_unit(unit_id: int):
    with Session(engine) as session:
        deactivate_all_units(session)
        unit = session.get(Unit, unit_id)
        unit.is_active = True
        session.add(unit)
        session.commit()
        session.refresh(unit)
        return unit

@router.get("/unit/all")
def get_all_units():
    with Session(engine) as session:
        units = session.exec(select(Unit)).all()
        return units
    

        
@router.get("/unit/active")
def get_active_unit():
    with Session(engine) as session:
        active_unit = session.exec(
            select(Unit).where(Unit.is_active == True)
        ).first()
        return active_unit

@router.get("/unit/{unit_id}")
def get_unit(unit_id):
    with Session(engine) as session:
        
        unit = session.exec(select(Unit).where(Unit.id == unit_id)).first()
        return unit

@router.post("/unit")
def create_unit(themechosen: str = None, roundcount: int = None):

    if (themechosen is None and roundcount is None):
        existing_unit_list = get_all_units()
        existing_themes = []
        for unit in existing_unit_list:
            existing_themes.append(unit.theme)

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
            deactivate_all_units(session)
            new_unit = Unit(theme = response["theme"], target_rounds = response["target_rounds"])
            session.add(new_unit)
            session.commit()
            session.refresh(new_unit)
            return new_unit
    
    else:
        with Session(engine) as session:
            deactivate_all_units(session)
            new_unit = Unit(theme = themechosen, target_rounds = roundcount)
            session.add(new_unit)
            session.commit()
            session.refresh(new_unit)
            return new_unit
    