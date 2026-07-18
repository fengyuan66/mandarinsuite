from models.character import Character
from sqlmodel import Session, select
from database import engine
from models.round import Round
from models.cohort import Cohort, CohortCharacter
from fastapi import APIRouter
from models.unit import Unit
from routers.ai import ai
import json
from fastapi import Body

router = APIRouter()

@router.get("/generation/known_hanzi/{unit_id}/{before_progress}")
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

@router.post("/generation/reading/{round_id}")
def generate_reading(round_id: int):
    with Session(engine) as session:
        round = session.get(Round, round_id)
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
* Aim for approximately 100–150 Chinese characters, excluding punctuation.
* Use Simplified Chinese and proper punctuation such as ，。！？
* Check that every sentence is natural Mandarin before responding.

Respond with only the passage text and no commentary, title, translation, notes, or formatting.
"""

    content = ai(prompt)
    return {"passage": content}


@router.post("/generation/reading-custom")
def generate_reading_custom(hanzi_list: list[str]):
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
* Check that every sentence is natural Mandarin before responding.

Respond with only the passage text and no commentary, title, translation, notes, or formatting.
"""

    passage = ai(prompt)
    return {"passage": passage}


@router.post("/generation/writing-dication/{round_id}")
def generate_writing_dictation(round_id: int):
    with Session(engine) as session:
        round = session.get(Round, round_id)
        unit = session.get(Unit, round.unit_id)

    allowlist = get_known_hanzi(round.unit_id, before_progress=round.progress)
    if len(allowlist) < 75:
        return {"skipped": True, "reason": "not enough known vocab yet!"}

    prompt = f"""Write a short paragraph in Mandarin, themed around "{unit.theme}".
Heavily prioritize using ONLY characters from this list: {allowlist}.
Favor extremely common, basic characters to keep the sentences natural and easy to read.
If a small number of other simple, very common characters are genuinely needed for the paragraph to read naturally, you may use them sparingly — but keep this to an absolute minimum.
Aim for about 100 words, but it is far more important that the paragraph be coherent, grammatical, natural Mandarin than that it hit any specific length — write fewer words if that produces better quality.
Use proper punctuation (，。).
Respond with ONLY the paragraph text, no other commentary.
"""

    paragraph = ai(prompt)
    return {"skipped": False, "paragraph": paragraph}


@router.post("/generation/fib-custom")
def generate_fib_custom(hanzi_list: list[str]):
    prompt = f"""For a very simple fill-in-the-blank style question, write one natural, extremely simple, beginner-level Mandarin sentence that uses some, not necessarily all of these characters: {hanzi_list}. One should be able to infer the context of the sentence even with those characters removed.
Then remove those characters from the sentence, replacing each with a blank ___.
Respond with ONLY a JSON object, no other text, in this exact format:
{{"sentence_with_blanks": "...", "answers": ["...", "..."]}}
"""
    result = json.loads(ai(prompt))
    return result

@router.post("/generation/writingdictation-custom")
def generate_writing_dictation_custom(hanzi_list: list[str]):
    prompt = f"""Write a short paragraph in Mandarin.
Heavily prioritize using ONLY characters from this list: {hanzi_list}.
Favor extremely common, basic characters to keep the sentences natural and easy to read.
If a small number of other simple, very common characters are genuinely needed for the paragraph to read naturally, you may use them sparingly — but keep this to an absolute minimum.
Aim for about 100 words, but it is far more important that the paragraph be coherent, grammatical, natural Mandarin than that it hit any specific length.
Use proper punctuation (，。).
Respond with ONLY the paragraph text, no other commentary.
"""
    paragraph = ai(prompt)
    return {"skipped": False, "paragraph": paragraph}

@router.post("/generation/fib/{round_id}")
def generate_fib(round_id: int):
    allowlist = get_characters_in_round(round_id)

    prompt = f"""For a very simple fill-in-the-blank style question, write one natural, extremely simple, beginner-level Mandarin sentence that uses some, not necessarily all of these characters: {allowlist}. One should be able to infer the context of the sentence even with those characters removed. 
Then remove those characters from the sentence, replacing each with a blank ___.
Respond with ONLY a JSON object, no other text, in this exact format:
{{"sentence_with_blanks": "...", "answers": ["...", "..."]}}
"""
    result = json.loads(ai(prompt))
    return result


@router.post("/generation/unit_review/{unit_id}")
def generate_unit_review(unit_id: int):
    with Session(engine) as session:
        unit = session.get(Unit, unit_id)
        allowlist = get_characters_in_unit(unit_id)
        paragraph_prompt = f"""Write a short paragraph in Mandarin, themed around "{unit.theme}".
Heavily prioritize using ONLY characters from this list: {allowlist}.
Favor extremely common, basic characters to keep the sentences natural and easy to read.
If a small number of other simple, very common characters are genuinely needed for the paragraph to read naturally, you may use them sparingly — but keep this to an absolute minimum.
Prioritize cohesion and natural quality over length — a short, coherent paragraph is better than a longer broken one.
Use proper punctuation (，。).
Respond with ONLY the paragraph text, no other commentary.
"""

        paragraph = ai(paragraph_prompt)

        fib_prompt = f"""For a very simple fill-in-the-blank style question, write one natural, extremely simple, beginner-level Mandarin sentence that uses some, not necessarily all of these characters: {allowlist}. One should be able to infer the context of the sentence even with those characters removed.
Then remove those characters from the sentence, replacing each with a blank ___.
Respond with ONLY a JSON object, no other text, in this exact format:
{{"sentence_with_blanks": "...", "answers": ["...", "..."]}}
"""
        fib_result = json.loads(ai(fib_prompt))

        return{
            "allowlist": allowlist,
            "paragraph": paragraph,
            "fib": fib_result,
        }
    

@router.post("/generation/free-write/{unit_id}")
def generate_free_write(unit_id: int):
    allowlist = get_characters_in_unit(unit_id)
    prompt = f"""Write a short, friendly writing prompt in English that would naturally lead a Mandarin learner
to write a ~100 word response using vocabulary they know. They know these characters: {allowlist}.
Respond with ONLY the prompt text, no other commentary.
"""
    return {"prompt": ai(prompt)}


@router.patch("/round/{round_id}/status")
def advance_round_status(round_id: int, new_status: str):
    with Session(engine) as session:
        round = session.get(Round, round_id)
        round.status = new_status
        session.add(round)
        session.commit()
        session.refresh(round)
        return round
    

