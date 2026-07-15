from fastapi import APIRouter
from routers.characterbank import get_hanzi, add_character
import json
from routers.ai import ai
from data.lookup import lookup_hanzi
from models.character import Character
from pydantic import ValidationError

router = APIRouter()

def discover_themed_characters(theme: str, count: int = 15) -> list[int]:
    existing_hanzi_list = get_hanzi()
    prompt = f"""Suggest {count} new single Mandarin characters related to the theme "{theme}", suitable for a learner.
    Do NOT include any of these existing characters: {existing_hanzi_list}.
    Respond with ONLY a JSON array of the characters themselves, no other text, e.g.: ["你", "好", "是", "不", "在"]
    """

    candidates = json.loads(ai(prompt))

    new_char_ids = []
    for hanzi in candidates:
        entry = lookup_hanzi(hanzi)
        if entry is None:
            continue
        try:
            character = Character(hanzi = hanzi, **entry)
            saved = add_character(character)
            new_char_ids.append(saved.id)
        except (ValidationError, TypeError):
            continue
    
    return new_char_ids




