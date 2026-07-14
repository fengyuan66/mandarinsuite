from fastapi import APIRouter
from sqlmodel import Session, select
from database import engine
from models.practicelog import PracticeLog, PracticeEntry


@router.post("/practicelog")
def create_practicelog():
    with Session(engine) as session:
        new_practicelog = PracticeLog()
        session.add(new_practicelog)
        session.commit()
        session.refresh(new_practicelog)
        return new_practicelog

@router.post("/practicelog/practiceentry")
def add_practiceentry(session_id: int, character_id: int, times_written: int):
    with Session(engine) as session:
        staged = PracticeEntry(session_id = session_id, character_id = character_id, times_written = times_written)
        session.add(staged)
        session.commit()
        session.refresh(staged)
        return staged