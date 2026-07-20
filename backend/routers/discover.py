from routers.characterbank import get_hanzi, add_character
from routers.cohort import create_cohort, cohort_add_character
from models.character import Character
from models.user import User
from auth import manager
from data.lookup import lookup_hanzi
from fastapi import APIRouter, Depends
from routers.ai import ai, safe_ai_json
import json
import random
from pydantic import ValidationError
router = APIRouter()

def capped_hanzi_list(user_id: int, limit: int = 100) -> list[str]:
    """Caps the exclusion list fed into discovery prompts so it can't grow unbounded."""
    hanzi_list = get_hanzi(user_id)
    if len(hanzi_list) > limit:
        return random.sample(hanzi_list, limit)
    return hanzi_list


# AI DISCOVERY OF NEW CHARACTERS

@router.post("/discover")
def ai_add_characters(cohort: bool = True, user: User = Depends(manager)):

    if (cohort):

        existing_hanzi_list = capped_hanzi_list(user.id)
        explore_prompt = f"""Suggest 5 new single Mandarin characters suitable for a learner to study next, preferably some that can combine into words together.
        Do NOT include any of these existing characters: {existing_hanzi_list}.
        Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
        """
        candidates = safe_ai_json(explore_prompt)
        if not isinstance(candidates, list):
            return {"created": [], "error": True, "message": "AI discovery temporarily unavailable, please try again."}

        created = []
        err = []
        skipped = []
        newcohort = None

        for hanzi in candidates:
            entry = lookup_hanzi(hanzi)
            if entry is None:
                err.append(hanzi)
                continue
            try:
                character = Character(hanzi = hanzi, **entry)
                created.append(add_character(character))

                if newcohort is None:
                    newcohort = create_cohort(user_id = user.id)
                    print(f"[DEBUG] created cohort id={newcohort.id}, is_active={newcohort.is_active}")

                cohort_add_character(newcohort.id, character.id)
                print(f"[DEBUG] linked character {character.id} ({hanzi}) to cohort {newcohort.id}")
            except (ValidationError, TypeError):
                skipped.append(hanzi)


            
        return {"created": created, "ERROR: Cannot find in database": err, "ERROR: skipped due to errors": skipped}


    else:
        existing_hanzi_list = capped_hanzi_list(user.id)
        explore_prompt = f"""Suggest 5 new single Mandarin characters suitable for a learner to study next, preferably some that can combine into words together.
        Do NOT include any of these existing characters: {existing_hanzi_list}.
        Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
        """

        candidates = safe_ai_json(explore_prompt)
        if not isinstance(candidates, list):
            return {"created": [], "error": True, "message": "AI discovery temporarily unavailable, please try again."}
        
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
