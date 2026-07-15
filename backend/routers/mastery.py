from sqlalchemy import func
from sqlmodel import Session, select
from database import engine
from models.character import Character
from models.practicelog import PracticeLog, PracticeEntry
from datetime import datetime

def get_weakest_characters(limit: int = 6) -> list [int]:
    with Session(engine) as session:
        
        #Practice times filter so that its always valid
        
        times_written = func.coalesce(func.sum(PracticeEntry.times_written), 0)

        
        operation = (
            select(
                Character.id,
                (times_written).label("total"),
                func.max(PracticeLog.session_time).label("last"),
            )
            .outerjoin(PracticeEntry, PracticeEntry.character_id == Character.id)
            .outerjoin(PracticeLog, PracticeEntry.session_id == PracticeLog.id)
            .group_by(Character.id)

        )

        rows = session.exec(operation).all()

        # TECHNICAL DECISIONL r.total MAY NEED TO HAVE HIGHER PRIORITY IN TERMS OF MASTERY SORTING THAN r.last

        rows_sorted = sorted(rows, key = lambda r: (r.last or datetime.min, r.total))

        weakest = rows_sorted[:limit]
        return [row.id for row in weakest]