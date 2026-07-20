from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import engine
from models.cohort import Cohort, CohortCharacter
from models.character import Character
from models.user import User
from auth import manager
router = APIRouter()

def deactivate_all_cohorts(session: Session, user_id: int):
    active_cohorts = session.exec(select(Cohort).where(Cohort.is_active==True, Cohort.user_id==user_id)).all() #select all cohorts
    for cohort in active_cohorts:
        cohort.is_active = False
        session.add(cohort)

def create_cohort(user_id: int, active: bool = True):
    if (active):
        with Session(engine) as session:
            deactivate_all_cohorts(session, user_id)
            new_cohort = Cohort(user_id = user_id)
            new_cohort.is_active = True
            session.add(new_cohort)
            session.commit()
            session.refresh(new_cohort)
            return new_cohort
    else:
        with Session(engine) as session:
            new_cohort = Cohort(user_id = user_id)
            new_cohort.is_active = False
            session.add(new_cohort)
            session.commit()
            session.refresh(new_cohort)
            return new_cohort

@router.post("/cohort")
def create_cohort_route(active: bool = True, user: User = Depends(manager)):
    return create_cohort(user_id = user.id, active = active)
    



@router.get("/cohort/all")
def get_all_cohorts(user: User = Depends(manager)):
    with Session(engine) as session:
        return session.exec(select(Cohort).where(Cohort.user_id == user.id).order_by(Cohort.id)).all()


@router.get("/cohort/archive")
def get_archive_cohort(target_cohort: Cohort, user: User = Depends(manager)):
    with Session(engine) as session:

        target_cohort_id = target_cohort.id

        active_cohort = session.exec(
            select(Cohort).where(Cohort.is_active == True, Cohort.user_id == user.id)
        ).first()


        print(f"[DEBUG] get_current_cohort found: {active_cohort}")




        if active_cohort.id == target_cohort.id:
            return get_current_cohort()
        
        #link = CohortCharacter objs linked to cohort via cohort_id field's property
        links = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id == target_cohort_id)
        ).all()

        character_ids = [link.character_id for link in links]
        
        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return{"cohort": target_cohort, "characters": characters}


@router.get("/cohort/current")
def get_current_cohort(user: User = Depends(manager)):
    with Session(engine) as session:

        all_active = session.exec(select(Cohort).where(Cohort.is_active == True, Cohort.user_id == user.id)).all()
        print(f"[DEBUG] all active cohorts: {[(c.id, c.is_active) for c in all_active]}")



        active_cohort = session.exec(
            select(Cohort).where(Cohort.is_active == True, Cohort.user_id == user.id)
        ).first()

        print(f"[DEBUG] get_current_cohort found: {active_cohort}")


        if active_cohort is None:
            return {"cohort": None, "characters": []}
        
        #link = linked to cohort via cohort_id field's property
        links = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id == active_cohort.id)
        ).all()

        
        character_ids = [link.character_id for link in links]
        
        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return{"cohort": active_cohort, "characters": characters}
    

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

@router.post("/cohort/{cohort_id}/character/{character_id}")
def cohort_add_character_route(cohort_id: int, character_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        cohort = session.get(Cohort, cohort_id)
        if cohort is None or cohort.user_id != user.id:
            raise HTTPException(404, "Cohort not found")
    return cohort_add_character(cohort_id, character_id)

#todo: add report on frontend


@router.post("/cohort/active/character/{character_id}")
def activecohort_add_character(character_id: int, user: User = Depends(manager)):

    with Session(engine) as session:
        activecohort = session.exec(
            select(Cohort).where(Cohort.is_active == True, Cohort.user_id == user.id)
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


@router.get("/cohort/{cohort_id}")
def get_cohort_by_id(cohort_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        cohort = session.exec(select(Cohort).where(Cohort.id == cohort_id, Cohort.user_id == user.id)).first()
        if cohort is None:
            raise HTTPException(404, "Cohort not found")
        links = session.exec(select(CohortCharacter).where(CohortCharacter.cohort_id == cohort_id)).all()
        character_ids = [l.character_id for l in links]
        characters = session.exec(select(Character).where(Character.id.in_(character_ids))).all()
        return {"cohort": cohort, "characters": characters}


