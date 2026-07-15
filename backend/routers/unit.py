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