from sqlalchemy import func
from sqlmodel import Session, select
from database import engine
from models.character import Character
from models.cohort import Cohort, CohortCharacter
from models.practicelog import PracticeLog, PracticeEntry
from datetime import datetime

def get_weakest_characters(user_id: int, limit: int = 6) -> list [int]:
    with Session(engine) as session:

        #Only consider characters this user has actually been shown before, via their own past cohorts
        seen_character_ids = session.exec(
            select(CohortCharacter.character_id)
            .join(Cohort, CohortCharacter.cohort_id == Cohort.id)
            .where(Cohort.user_id == user_id)
        ).all()

        if not seen_character_ids:
            return []

        #Practice times filter so that its always valid

        user_entries = (
            select(
                PracticeEntry.character_id.label("character_id"),
                PracticeEntry.times_written.label("times_written"),
                PracticeLog.session_time.label("session_time"),
            )
            .join(PracticeLog, PracticeEntry.session_id == PracticeLog.id)
            .where(PracticeLog.user_id == user_id)
            .subquery()
        )

        times_written = func.coalesce(func.sum(user_entries.c.times_written), 0)

        operation = (
            select(
                Character.id,
                (times_written).label("total"),
                func.max(user_entries.c.session_time).label("last"),
            )
            .where(Character.id.in_(seen_character_ids))
            .outerjoin(user_entries, user_entries.c.character_id == Character.id)
            .group_by(Character.id)

        )

        rows = session.exec(operation).all()

        # TECHNICAL DECISIONL r.total MAY NEED TO HAVE HIGHER PRIORITY IN TERMS OF MASTERY SORTING THAN r.last

        rows_sorted = sorted(rows, key = lambda r: (r.last or datetime.min, r.total))

        weakest = rows_sorted[:limit]
        return [row.id for row in weakest]