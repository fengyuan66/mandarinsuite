from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import engine
from models.practicelog import PracticeLog, PracticeEntry
from models.user import User
from auth import manager
from fastapi import HTTPException
router = APIRouter()

@router.post("/practicelog")
def create_practicelog(user: User = Depends(manager)):
    with Session(engine) as session:
        new_practicelog = PracticeLog(user_id = user.id)
        session.add(new_practicelog)
        session.commit()
        session.refresh(new_practicelog)
        return new_practicelog

@router.post("/practicelog/practiceentry/{session_id}/{character_id}/{times_written}")
def add_practiceentry(session_id: int, character_id: int, times_written: int, user: User = Depends(manager)):
    with Session(engine) as session:
        practicelog = session.get(PracticeLog, session_id)
        if practicelog is None or practicelog.user_id != user.id:
            raise HTTPException(404, "Practice log not found")
        staged = PracticeEntry(session_id = session_id, character_id = character_id, times_written = times_written)
        session.add(staged)
        session.commit()
        session.refresh(staged)
        return staged


@router.get("/practicelog/archived")
def get_practicelog(id: int, user: User = Depends(manager)):
    with Session(engine) as session:

        selected = session.exec(
            select(PracticeLog).where(PracticeLog.id == id, PracticeLog.user_id == user.id)
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

        
@router.get("/practicelog/all")
def get_my_practicelogs(user: User = Depends(manager)):
    with Session(engine) as session:
        logs = session.exec(
            select(PracticeLog)
            .where(PracticeLog.user_id == user.id)
            .order_by(PracticeLog.session_time.desc())
        ).all()
        return logs