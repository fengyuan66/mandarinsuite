from routers.characterbank import get_hanzi, add_character
from models.character import Character
from fastapi import APIRouter
from routers.ai import ai
import json

router = APIRouter()




@router.post("/discover")
def ai_add_characters():
    existing_hanzi_list = get_hanzi()
    explore_prompt = f"""Generate 5 new Mandarin vocabulary characters suitable for a learner, preferably if some can form a word together.
    Do NOT include any of these existing characters: {existing_hanzi_list}.
    Respond with ONLY a JSON array, no other text, in this exact format:
    [{{"hanzi": "你", "pinyin": "nǐ", "meaning": "you", "strokec": 7}}]
    """

    hanzis = json.loads(ai("llama-3.1-8b-instant", explore_prompt))
    created = []
    for character_data in hanzis:
        created.append(add_character(Character(**character_data)))
    return created
