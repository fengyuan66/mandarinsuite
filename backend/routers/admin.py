from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import engine
from models.user import User
from models.unit import Unit
from models.cohort import Cohort, CohortCharacter
from models.round import Round
from models.practicelog import PracticeLog, PracticeEntry
from auth import manager

router = APIRouter()

@router.delete("/admin/wipe")
def wipe_my_data(user: User = Depends(manager)):
    with Session(engine) as session:
        practicelogs = session.exec(select(PracticeLog).where(PracticeLog.user_id == user.id)).all()
        for log in practicelogs:
            entries = session.exec(select(PracticeEntry).where(PracticeEntry.session_id == log.id)).all()
            for entry in entries:
                session.delete(entry)
            session.delete(log)

        cohorts = session.exec(select(Cohort).where(Cohort.user_id == user.id)).all()
        for cohort in cohorts:
            links = session.exec(select(CohortCharacter).where(CohortCharacter.cohort_id == cohort.id)).all()
            for link in links:
                session.delete(link)

        rounds = session.exec(select(Round).where(Round.user_id == user.id)).all()
        for round in rounds:
            session.delete(round)

        for cohort in cohorts:
            session.delete(cohort)

        units = session.exec(select(Unit).where(Unit.user_id == user.id)).all()
        for unit in units:
            session.delete(unit)

        session.commit()

    return {"wiped": True}