# Bug Report

Living doc. Add anything witnessed regardless of severity or confidence — vague hunches included. We investigate based on symptoms, not assumptions. Update status as we go: `open` / `investigating` / `fixed` / `wontfix` / `by-design`.

Format per entry:
```
## [status] Short title
- **Symptom:** what was actually observed
- **Confidence:** confirmed / suspected / hunch
- **Where:** file/endpoint/component if known, else "unknown"
- **Notes:** anything relevant — repro steps, related entries, theories
```

---

## [open] Writing-dictation almost never triggers within a unit
- **Symptom:** `POST /generation/writing-dication/{round_id}` returned `{"skipped": true, "reason": "not enough known vocab yet!"}` in all 5 rounds, across two full automated walkthroughs.
- **Confidence:** confirmed, reproduced twice
- **Where:** `backend/routers/generation.py` — `get_known_hanzi()` scoping + the 75-character threshold in `generate_writing_dictation`
- **Notes:** `get_known_hanzi` only counts vocabulary from earlier rounds *within the same unit*. With ~15-21 new characters/round and 5 rounds/unit, cumulative known vocab tops out around 60-75 by the last round — never comfortably clears the threshold before the unit ends. Needs a decision: lower the threshold, or scope known-vocab across all units instead of per-unit.

## [open] `GET /round/{unit_id}` ignores the path parameter entirely
- **Symptom:** calling `GET /round/{id}` always returns `null`, regardless of what id is passed.
- **Confidence:** confirmed
- **Where:** `backend/routers/round.py`
- **Notes:** route declared as `@router.get("/round/{unit_id}")` but the function signature is `def get_round(id: int = None)` — the path segment name (`unit_id`) doesn't match the function's parameter name (`id`), so the URL's actual value is never read; `id` silently stays `None`. Not currently called by the live frontend (which uses `/unit/{id}/round/current` instead), so it hasn't caused a visible bug yet, but it's broken and worth fixing before anything starts relying on it. Fix: rename the parameter to match the path (`round_id`) and use it in the query.

## [fixed, verify still applied] FIB blanks concatenated without separators broke answer alignment
- **Symptom:** in one walkthrough run, a FIB sentence had `"______"` (6 underscores, no separator) representing two consecutive blanks; `fillInBlanks`'s `/_+/g` regex treated it as one blank, misaligning every answer after it.
- **Confidence:** confirmed (that specific run); did not reproduce in the next run (LLM output varies)
- **Where:** `frontend/src/Pages/Start.jsx` — `fillInBlanks`
- **Notes:** fix given was changing the regex from `/_+/g` (greedy) to `/___/g` (exactly three, matched repeatedly). Need to confirm this was actually applied to the file.

## [open, low severity] Duplicate near-identical helper functions in generation.py
- **Symptom:** none (not a functional bug) — code smell.
- **Confidence:** confirmed by reading the file
- **Where:** `backend/routers/generation.py` — `get_known_hanzi`, `get_known_Characters`, `get_characters_in_unit`, `get_characters_in_round`
- **Notes:** four almost-identical blocks (Round → Cohort → CohortCharacter → Character), differing only in filter/return shape. Not urgent, but worth consolidating into one parameterized function eventually.

## [open] Practice-entry logging never wired to the frontend
- **Symptom:** the `practicing` wizard screen has no way to actually record character write-counts.
- **Confidence:** confirmed
- **Where:** `frontend/src/Pages/Start.jsx` (`practicing` block) — backend endpoints (`POST /practicelog`, `POST /practicelog/practiceentry`) exist and work, just unused
- **Notes:** means the mastery-scoring algorithm has no real data to work with in practice — every character looks equally "never practiced" until this is built.

## [open] Dictation reveal shows placeholder text, not real content
- **Symptom:** `dictation_offered` screen shows a static message, not real cohort character/metadata reveal.
- **Confidence:** confirmed
- **Where:** `frontend/src/Pages/Start.jsx` (`dictation_offered` block); `routers/dictation.py` was never built
- **Notes:** the "show answers" button under this step currently reveals `HanziDisplay` renders of the cohort (added later, may already partially cover this — verify current behavior).

## [deferred, not a bug] TTS / audio dictation
- **Status:** intentionally out of scope for now, tracked here only so it isn't forgotten.

## [by-design, confirmed benign] Unit-review paragraph used a character outside the allowlist
- **Symptom:** generated paragraph used `有` even though it wasn't in the provided allowlist.
- **Confidence:** confirmed, but expected
- **Where:** `backend/routers/generation.py` — `generate_unit_review`
- **Notes:** prompt explicitly permits "sparingly" using other very common characters for coherence; `有` is about as basic as it gets. Not a bug, logged for awareness only.

---

## Investigation candidates (unconfirmed, add as reproduced)

- Anything from user manual testing not yet captured here — add as you find it, even "something felt off" with no repro steps yet.



-------------------------------

MANUAL SECTION:


1. FIB content is constantly repeated. What showed up in the first round appeared for all rounds following

2. Words from previous cohort constantly repeated in latter cohorts
After running two rounds, the wordbank contained
春节端粽龙舞灯月花鼓酒梅福寿祭学习中国人年红爆炮纸剪祥喜谜狮笼菊扫墓桂

and the latest cohort contained

春节端粽龙舞年红爆炮纸剪祥喜谜狮笼菊扫墓桂

First cohort contained

学、习、中、国、人

This means that 

灯、月、花、鼓、酒、梅、福、寿、祭、came out of nowhere

For the next few rounds, regardless of unit switch, 学、习、中、国、人 stayed around

3. For unit reviews:
 - Check if AI prompts are the same as their normal counterparts
 - Have option to reaveal FIB just like normal

4. For some reason the first cohort had an ID of 2. Not sure if related but the last cohort in a target_cohort of 5 had ID 6