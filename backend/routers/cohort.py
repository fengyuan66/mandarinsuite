from fastapi import APIRouter
from sqlmodel import Session, select
from database import engine
from models.cohort import Cohort, CohortCharacter
from models.character import Character


def deactivate_all_cohorts(session: Session):
    active_cohorts = session.exec(select(Cohort).where(Cohort.is_active==True)).all() #select all cohorts
    for cohort in active_cohorts:
        cohort.is_active = False
        session.add(cohort)

@router.post("/cohort")
def create_cohort():
    with Session(engine) as session:
        new_cohort = Cohort()
        session.add(new_cohort)
        session.commit()
        session.refresh(new_cohort)
        return new_cohort
    
@router.post("/cohort/{cohort_id}/character/{character_id}")
def cohort_add_character(cohort_id: int, character_id: int):

    #If character is already found to exist
    with Session(engine) as session:
        existing = session.exec(
            select(CohortCharacter) #select CohortCharacter where the cohort id is... and the character id is...
            .where(CohortCharacter.cohort_id == cohort_id)
            .where(CohortCharacter.character_id == character_id)
        ).first()
        if existing:
            return existing
        
    link = CohortCharacter(cohort_id = cohort_id, character_id = character_id)
    session.add(link)
    session.commit()
    session.refresh(link)
    return link

#todo: add report on frontend


@router.post("/cohort/active/character/{character_id}")
def cohort_add_character(character_id: int):
    
    with Session(engine) as session:
        activecohort = session.exec(
            select(Cohort).where(Cohort.is_active == True)
        ).first()    

        charexisting = session.exec(
            select(CohortCharacter)
            .where(CohortCharacter.cohort_id == activecohort.id)
            .where(CohortCharacter.character_id == character_id)
        ).first()

        if charexisting is not None:
            return charexisting
    

    link = CohortCharacter(cohort_id = activecohort.id, character_id = character_id)
    session.add(link)
    session.commit()
    session.refresh(link)
    return link


@router.get("/cohort/current")
def get_current_cohort():
    with Session(engine) as session:
        active_cohort = session.exec(
            select(Cohort).where(Cohort.is_active == True)
        ).first()

        if active_cohort is None:
            return {"cohort": None, "characters": []}
        
        #link = linked to cohort via cohort_id field's property
        links = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id == active_cohort.id)
        ).all()

        for link in links:
            character_ids = [link.character_id]
        
        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all

        return{"cohort": active_cohort, "characters": characters}
    
@router.get(".cohort/archive")
def get_archive_cohort(target_cohort: Cohort):
    with Session(engine) as session:

        target_cohort_id = target_cohort.id

        active_cohort = session.exec(
            select(Cohort).where(Cohort.is_active == True)
        ).first()

        if active_cohort == target_cohort:
            return get_current_cohort
        
        #link = CohortCharacter objs linked to cohort via cohort_id field's property
        links = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id == target_cohort_id)
        ).all()

        character_ids = [link.character_id for link in links]
        
        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all

        return{"cohort": target_cohort, "characters": characters}