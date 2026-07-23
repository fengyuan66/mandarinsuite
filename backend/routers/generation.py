from models.character import Character
from sqlmodel import Session, select
from database import engine
from models.round import Round
from models.cohort import Cohort, CohortCharacter
from fastapi import APIRouter, Depends, HTTPException
from models.unit import Unit
from models.user import User
from auth import manager
from routers.ai import ai
import json
from fastapi import Body
import random
import re

router = APIRouter()

def safe_ai(prompt, model: str = "openai/gpt-oss-120b", temperature: float = 1.0, response_format: dict | None = None):
    """Returns the AI's raw text, OR None if generation failed for any reason."""
    try:
        return ai(prompt, model, temperature=temperature, response_format=response_format)
    except Exception:
        return None

def generate_reading_passage(prompt):
    """USE FOR READING ONLY BECAUSE PREVENTS OVERTHINKING FROM GROQ"""
    def _attempt():
        try:
            return ai(prompt, reasoning_effort="low", max_completion_tokens=800)
        except Exception:
            return None

    text = _attempt()
    if not text or not text.strip():
        text = _attempt()
    return text if text and text.strip() else None

def safe_ai_json_fib(prompt, model: str = "openai/gpt-oss-120b", temperature: float = 0.4):
    """FIB ONLY! Returns the AI's parsed JSON, OR None if generation/parsing failed."""
    text = safe_ai(prompt, model, temperature=temperature, response_format={"type": "json_object"})
    if text is None:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None

def get_known_hanzi(unit_id: int, before_progress: int | None = None) -> list[str]:
    with Session(engine) as session:

        conditions = [Round.unit_id == unit_id]
        if before_progress is not None:
            conditions.append(Round.progress < before_progress)

        statement = select(Round).where(*conditions)
        rounds = session.exec(statement).all()

        cohort_ids = [round.cohort_id for round in rounds]

        linkedchars = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id.in_(cohort_ids))
        ).all()
        character_ids = [link.character_id for link in linkedchars]

        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return [character.hanzi for character in characters]

@router.get("/generation/known_hanzi/{unit_id}/{before_progress}")
def get_known_hanzi_route(unit_id: int, before_progress: int | None = None, user: User = Depends(manager)) -> list[str]:
    with Session(engine) as session:
        unit = session.exec(select(Unit).where(Unit.id == unit_id, Unit.user_id == user.id)).first()
        if unit is None:
            raise HTTPException(404, "Unit not found")
    return get_known_hanzi(unit_id, before_progress)

def get_known_Characters(unit_id: int, before_progress: int | None = None) -> list[Character]:
    with Session(engine) as session:

        conditions = [Round.unit_id == unit_id]
        if before_progress is not None:
            conditions.append(Round.progress < before_progress)

        statement = select(Round).where(*conditions)
        rounds = session.exec(statement).all()

        cohort_ids = [round.cohort_id for round in rounds]

        linkedchars = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id.in_(cohort_ids))
        ).all()
        character_ids = [link.character_id for link in linkedchars]

        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return [character for character in characters]
    
def get_characters_in_unit(unit_id: int) -> list[str]:
    with Session(engine) as session:
       
        statement = select(Round).where(Round.unit_id == unit_id)
        rounds = session.exec(statement).all()

        cohort_ids = [round.cohort_id for round in rounds]

        linkedchars = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id.in_(cohort_ids))
        ).all()
        character_ids = [link.character_id for link in linkedchars]

        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return [character.hanzi for character in characters]
    
    
def get_characters_in_round(round_id: int) -> list[str]:
    with Session(engine) as session:
       
        statement = select(Round).where(Round.id == round_id)
        rounds = session.exec(statement).all()

        cohort_ids = [round.cohort_id for round in rounds]

        linkedchars = session.exec(
            select(CohortCharacter).where(CohortCharacter.cohort_id.in_(cohort_ids))
        ).all()
        character_ids = [link.character_id for link in linkedchars]

        characters = session.exec(
            select(Character).where(Character.id.in_(character_ids))
        ).all()

        return [character.hanzi for character in characters]


@router.get("/generation/getuser")
def get_user(user: User = Depends(manager)):
    return user.email

@router.get("/generation/getuser/getcreate")
def get_user_created(user: User = Depends(manager)):
    return user.created_at

@router.post("/generation/reading/{round_id}")
def generate_reading(round_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        round = session.get(Round, round_id)
        if round is None or round.user_id != user.id:
            raise HTTPException(404, "Round not found")
        unit = session.get(Unit, round.unit_id)

    allowlist = get_characters_in_round(round_id)
    prompt = f"""
Write a short, engaging Mandarin Chinese reading passage for a language learner, based on the theme "{unit.theme}".

Target vocabulary or characters:
{allowlist}

Requirements:

* Use the target items frequently, but only where they sound natural and grammatically correct.
* Prefer using target characters inside common, meaningful words rather than inserting them individually.
* Reuse important target words across the passage to reinforce recognition, but avoid awkward repetition or keyword stuffing.
* Do not force every target item into the passage. Omit an item when using it would make the passage unnatural.
* Use simple, beginner-friendly vocabulary and sentence structures.
* Include a clear situation, event, or idea so the passage feels coherent and engaging.
* Aim for approximately 100-150 Chinese characters, excluding punctuation.
* Use Simplified Chinese and proper punctuation such as ，。！？

Respond with only the passage text and no commentary, title, translation, notes, or formatting.
"""

    content = generate_reading_passage(prompt)
    if content is None:
        content = "AI generation is temporarily unavailable. Please try again shortly."
    return {"passage": content}


@router.post("/generation/reading-custom")
def generate_reading_custom(hanzi_list: list[str], user: User = Depends(manager)):
    prompt = f"""
Write a short, engaging Mandarin Chinese reading passage for a beginner language learner.

Target vocabulary or characters:
{hanzi_list}

Requirements:

* Use the target items frequently, but only where they sound natural and grammatically correct.
* Prefer using target characters inside common, meaningful words rather than inserting them individually.
* Reuse important target vocabs across the passage to reinforce recognition, but avoid awkward repetition or keyword stuffing.
* Do not force every target item into the passage. Omit an item when using it would make the passage unnatural.
* Use simple, beginner-friendly vocabulary and sentence structures.
* Include a clear situation, event, or idea so the passage feels coherent and engaging.
* Aim for approximately 100–150 Chinese characters, excluding punctuation.
* Use Simplified Chinese and proper punctuation such as ，。！？

Respond with only the passage text and no commentary, title, translation, notes, or formatting.
"""

    passage = generate_reading_passage(prompt)
    if passage is None:
        passage = "AI generation is temporarily unavailable. Please try again shortly."
    return {"passage": passage}

@router.post("/generation/writing-dication/{round_id}")
def generate_writing_dictation(round_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        round = session.get(Round, round_id)
        if round is None or round.user_id != user.id:
            raise HTTPException(404, "Round not found")
        unit = session.get(Unit, round.unit_id)

    allowlist = get_known_hanzi(round.unit_id, before_progress=round.progress)
    if len(allowlist) < 75:
        return {"skipped": True, "reason": "not enough known vocab yet!"}

    prompt = f"""Write a short paragraph in Mandarin, themed around "{unit.theme}".
Prioritize characters from this list: {allowlist}.
Favor extremely common, basic characters to keep the sentences natural, grammatically correct, and easy to read.
Aim for about 100 characters, but it is far more important that the paragraph be coherent, grammatical, natural Mandarin than that it hit any specific length — write fewer words if that produces better quality.
Use proper punctuation (，。).
Respond with ONLY the paragraph text, no other commentary.
"""

    paragraph = safe_ai(prompt)
    if paragraph is None:
        return {"skipped": True, "reason": "AI generation temporarily unavailable, please try again shortly"}
    return {"skipped": False, "paragraph": paragraph}



import random



FIB_EXAMPLES = [
    '{"sentence_with_blanks": "今天是___，我们要吃粽子。", "answers": ["端午节"]}',
    '{"sentence_with_blanks": "他每天早上都___去公园跑步。", "answers": ["喜欢"]}',
    '{"sentence_with_blanks": "这家___的服务员非常___。", "answers": ["餐厅", "友好"]}',  # keep answers Chinese in real version
]

def build_fib_prompt(allowlist):
    example = random.choice(FIB_EXAMPLES)
    sample_size = min(10, len(allowlist))
    sample = random.sample(allowlist, sample_size) if sample_size else allowlist

    return f"""You are a fluent Chinese speaker living in China today. Write one natural sentence you'd actually say in daily life.

Target characters (use at least 1, and only when they make sense or can form actual words that make sense in the given context): {sample}

Rules:
* Every word must be a REAL, existing Mandarin word. never invent one, and never swap in a target character just because it looks or sounds similar to the character a real word actually needs (e.g. don't write 磁器 when the real word is 瓷器 — 磁 and 瓷 are different characters). If a target character doesn't cleanly form a real word here, use it alone as a single-character word instead, or leave it out — never force a fabricated combination.
* Making complete, natural, everyday Mandarin sense matters more than anything else — never force in a target word if it breaks that.
* Vary length (~10-20 characters), topic, and structure each time — pick randomly from things like school, food, weather, family, hobbies, shopping, travel, work, health.
* Turn 1-3 of the target words you actually used into blanks (___) — the blanked word(s) must be target words, not unrelated common words.

Respond with ONLY a JSON object, no other text, in this exact format:
{example}
"""

def _fib_is_well_formed(result):
    if not isinstance(result, dict):
        return False
    sentence = result.get("sentence_with_blanks")
    answers = result.get("answers")
    if not isinstance(sentence, str) or not isinstance(answers, list):
        return False
    blanks = re.findall(r"_+", sentence)
    if len(blanks) != len(answers) or any(b != "___" for b in blanks):
        return False
    if re.search(r"___\s+___", sentence):
        return False
    return True

def generate_fib_content(allowlist):
    prompt = build_fib_prompt(allowlist)
    result = safe_ai_json_fib(prompt, temperature=0.6)
    if not _fib_is_well_formed(result):
        result = safe_ai_json_fib(prompt, temperature=0.5) # one retry on malformed output
    if not _fib_is_well_formed(result):
        result = {
            "sentence_with_blanks": "AI generation is temporarily unavailable. Please try again shortly. ___",
            "answers": ["(unavailable)"],
        }
    return result


@router.post("/generation/fib-custom")
def generate_fib_custom(hanzi_list: list[str], user: User = Depends(manager)):
    
    return generate_fib_content(hanzi_list)

@router.post("/generation/writingdictation-custom")
def generate_writing_dictation_custom(hanzi_list: list[str], user: User = Depends(manager)):
    prompt = f"""Write a short paragraph in Mandarin.
Prioritize characters from this list: {hanzi_list}.
Favor extremely common, basic characters to keep the sentences natural, grammatically correct, and easy to read.
Aim for about 100 characters, but it is far more important that the paragraph be coherent, grammatical, natural Mandarin than that it hit any specific length — write fewer words if that produces better quality.
Use proper punctuation (，。).
Respond with ONLY the paragraph text, no other commentary.
"""
    paragraph = safe_ai(prompt)
    if paragraph is None:
        return {"skipped": True, "reason": "AI generation temporarily unavailable, please try again shortly"}
    return {"skipped": False, "paragraph": paragraph}

@router.post("/generation/fib/{round_id}")
def generate_fib(round_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        round = session.get(Round, round_id)
        if round is None or round.user_id != user.id:
            raise HTTPException(404, "Round not found")

    allowlist = get_characters_in_round(round_id)

    
    return generate_fib_content(allowlist)


@router.post("/generation/unit_review/{unit_id}")
def generate_unit_review(unit_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        unit = session.get(Unit, unit_id)
        if unit is None or unit.user_id != user.id:
            raise HTTPException(404, "Unit not found")
        allowlist = get_characters_in_unit(unit_id)
        paragraph_prompt = f"""Write a short paragraph in Mandarin, themed around "{unit.theme}".
Heavily prioritize using ONLY characters from this list: {allowlist}.
Favor extremely common, basic characters to keep the sentences natural and easy to read.
If a small number of other simple, very common characters are genuinely needed for the paragraph to read naturally, you may use them sparingly — but keep this to an absolute minimum.
Prioritize cohesion and natural quality over length — a short, coherent paragraph is better than a longer broken one.
Use proper punctuation (，。).
Respond with ONLY the paragraph text, no other commentary.
"""

        paragraph = safe_ai(paragraph_prompt)
        if paragraph is None:
            paragraph = "AI generation is temporarily unavailable. Please try again shortly."

        fib_result = generate_fib_content(allowlist)

        return{
            "allowlist": allowlist,
            "paragraph": paragraph,
            "fib": fib_result,
        }
    

@router.post("/generation/free-write/{unit_id}")
def generate_free_write(unit_id: int, user: User = Depends(manager)):
    with Session(engine) as session:
        unit = session.get(Unit, unit_id)
        if unit is None or unit.user_id != user.id:
            raise HTTPException(404, "Unit not found")
    allowlist = get_characters_in_unit(unit_id)
    prompt = f"""Write a short, friendly writing prompt in English that would naturally lead a Mandarin learner
to write a ~100 word response using vocabulary they know. They know these characters: {allowlist}.
Respond with ONLY the prompt text, no other commentary.
"""
    content = safe_ai(prompt)
    if content is None:
        content = "AI generation is temporarily unavailable. Please try again shortly."
    return {"prompt": content}


@router.patch("/round/{round_id}/status")
def advance_round_status(round_id: int, new_status: str, user: User = Depends(manager)):
    with Session(engine) as session:
        round = session.get(Round, round_id)
        if round is None or round.user_id != user.id:
            raise HTTPException(404, "Round not found")
        round.status = new_status
        session.add(round)
        session.commit()
        session.refresh(round)
        return round
    

