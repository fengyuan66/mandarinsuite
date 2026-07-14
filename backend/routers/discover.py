from routers.characterbank import get_hanzi, add_character
from routers.cohort import create_cohort, cohort_add_character
from models.character import Character
from data.lookup import lookup_hanzi
from fastapi import APIRouter
from routers.ai import ai
import json
from pydantic import ValidationError
router = APIRouter()


# AI DISCOVERY OF NEW CHARACTERS

@router.post("/discover")
def ai_add_characters(cohort: bool):

    if (cohort):

        existing_hanzi_list = get_hanzi()
        explore_prompt = f"""Suggest 5 new single Mandarin characters suitable for a learner to study next, preferably some that can combine into words together.
        Do NOT include any of these existing characters: {existing_hanzi_list}.
        Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
        """
        candidates = json.loads(ai("llama-3.1-8b-instant", explore_prompt))
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
                newcohort = create_cohort()
                cohort_add_character(newcohort, character.id)
            except (ValidationError, TypeError):
                skipped.append(hanzi)


            
        return {"created": created, "ERROR: Cannot find in database": err, "ERROR: skipped due to errors": skipped}


    else:
        existing_hanzi_list = get_hanzi()
        explore_prompt = f"""Suggest 5 new single Mandarin characters suitable for a learner to study next, preferably some that can combine into words together.
        Do NOT include any of these existing characters: {existing_hanzi_list}.
        Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
        """
        candidates = json.loads(ai("llama-3.1-8b-instant", explore_prompt))
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
