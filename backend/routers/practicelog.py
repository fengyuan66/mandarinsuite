from fastapi import APIRouter
from sqlmodel import Session, select
from database import engine

@router.post("/practicelog")
def add_practice(log: PracticeLog):
    with Session(engine) as session:
        session.add(log)
        session.refresh(log)
        return log