from fastapi import APIRouter
from sqlmodel import Session, select
from database import engine
from models.practicelog import PracticeLog, PracticeEntry
from fastapi import HTTPException
router = APIRouter()

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
    
    
@router.get("/practicelog/archived")
def get_practicelog(id: int):
    with Session(engine) as session:
        
        selected = session.exec(
            select(PracticeLog).where(PracticeLog.id == id)
        ).first()
        if selected is None:
            raise HTTPException(
                status_code = 404,
                detail = "No practice log with {id} found!"
            )

        entries = session.exec(
            select(PracticeEntry)
            .where(PracticeEntry.session_id == selected.id)
        ).all()

        return {
            "id": selected.id,
            "session_time": selected.session_time,
            "entries": entries
        }

        