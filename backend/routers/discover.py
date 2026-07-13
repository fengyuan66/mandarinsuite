from routers.wordbank import get_hanzi, add_word
from models.word import Word
from fastapi import APIRouter
from routers.ai import ai
import json

router = APIRouter()





@router.post("/discover")
def ai_add_words():
    existing_hanzi_list = get_hanzi()
    explore_prompt = f"""Generate 5 new Mandarin vocabulary words suitable for a learner.
    Do NOT include any of these existing words: {existing_hanzi_list}.
    Respond with ONLY a JSON array, no other text, in this exact format:
    [{{"hanzi": "你好", "pinyin": "nǐ hǎo", "meaning": "hello", "strokec": 9}}]
    """

    hanzis = json.loads(ai("llama-3.1-8b-instant", explore_prompt))
    created = []
    for word_data in hanzis:
        created.append(add_word(Word(**word_data)))
    return created

