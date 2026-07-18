from routers.characterbank import get_hanzi, add_character
from routers.cohort import create_cohort, cohort_add_character
from models.character import Character
from models.user import User
from auth import manager
from data.lookup import lookup_hanzi
from fastapi import APIRouter, Depends
from routers.ai import ai
import json
from pydantic import ValidationError
router = APIRouter()


# AI DISCOVERY OF NEW CHARACTERS

@router.post("/discover")
def ai_add_characters(cohort: bool = True, user: User = Depends(manager)):

    if (cohort):

        existing_hanzi_list = get_hanzi()
        explore_prompt = f"""Suggest 5 new single Mandarin characters suitable for a learner to study next, preferably some that can combine into words together.
        Do NOT include any of these existing characters: {existing_hanzi_list}.
        Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
        """
        raw_response = ai(explore_prompt)
        try:
            candidates = json.loads(raw_response)
        except json.JSONDecodeError:
            return {"error": "AI response was not valid JSON!", "raw_response": raw_response}

        created = []
        err = []
        skipped = []
        newcohort = create_cohort(user_id = user.id)


        print(f"[DEBUG] created cohort id={newcohort.id}, is_active={newcohort.is_active}")



        for hanzi in candidates:
            entry = lookup_hanzi(hanzi)
            if entry is None:
                err.append(hanzi)
                continue
            try:
                character = Character(hanzi = hanzi, **entry)
                created.append(add_character(character))
                cohort_add_character(newcohort.id, character.id)

                
                print(f"[DEBUG] linked character {character.id} ({hanzi}) to cohort {newcohort.id}")
            
            
            except (ValidationError, TypeError):
                skipped.append(hanzi)


            
        return {"created": created, "ERROR: Cannot find in database": err, "ERROR: skipped due to errors": skipped}


    else:
        existing_hanzi_list = get_hanzi()
        explore_prompt = f"""Suggest 5 new single Mandarin characters suitable for a learner to study next, preferably some that can combine into words together.
        Do NOT include any of these existing characters: {existing_hanzi_list}.
        Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
        """
        candidates = json.loads(ai(explore_prompt))
        created = []
        err = []
        skipped = []

        for hanzi in candidates:
            entry = lookup_hanzi(hanzi)
            if entry is None:
                err.append(hanzi)
                continue
            try:
                character = Character(hanzi = hanzi, **entry)
                created.append(add_character(character))
            except (ValidationError, TypeError):
                skipped.append(hanzi)


            
        return {"created": created, "ERROR: Cannot find in database": err, "ERROR: skipped due to errors": skipped}
