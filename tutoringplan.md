# Mandarin Suite — Learning-Driven Build Plan

## Context
The repo currently contains only [features.md](features.md) (product spec) and an empty `backend/` folder — nothing has been built yet. The user wants to build Mandarin Suite themselves, with me acting as a **read-only tutor**: I explain concepts clearly when they come up, but the user writes the actual code. The main thread is "keep the project moving forward"; concept explanations are woven in as needed, not front-loaded as a separate course.

Stack choice: user proposed **React frontend + Next.js backend**, but asked what I think.

**My recommendation:** Use a single **Next.js app** (App Router) rather than two separate projects. Next.js *is* React for the frontend, and its API routes / route handlers give you the backend in the same codebase — no separate Express/FastAPI server, no CORS setup, one dev server, one deploy. This is almost certainly what "React frontend, Next.js backend" was reaching for. We'll confirm this with the user before starting, since it changes the first lesson (project scaffolding).

## My role (read-only tutor)
- I do not write feature code into the repo. I explain, review, point out bugs/patterns, and answer questions.
- The user runs commands and writes code themselves; I read their code and give feedback.
- When a new concept surfaces naturally (e.g. "what's a route handler", "what's state", "why do I need a key prop"), I stop and explain it simply before moving on.
- Progress is tracked informally against the milestone list below — no separate curriculum doc, we just work through the project.

## Proposed milestone order (mirrors features.md, sequenced by prerequisite)
1. **Foundations & scaffolding** — Next.js project setup, folder structure, what App Router does, running the dev server. (First real lesson: React components, props, basic page routing.)
2. **Word bank + progress tracking data model** — since almost every feature reads/writes vocab and progress, this comes first. Concepts: data modeling, local state vs. persistence, picking a simple storage layer (start with local JSON/SQLite before any cloud DB).
3. **New Words Discovery** — first AI integration point. Concepts: calling an LLM API from a route handler, API keys/env vars, basic prompt design.
4. **New Vocabulary Practice** (write-X-times) — first real UI interaction feature. Concepts: forms, controlled inputs, simple validation, writing to the word bank/progress store.
5. **Dictation** (word-only, then sentence) — extends practice UI, introduces audio (TTS) or text-based grading logic.
6. **Reading** — AI-generated short stories using recent vocab. Concepts: prompt templating with dynamic context (recent vocab list).
7. **Listening** — AI-generated audio stories. Concepts: TTS APIs, audio playback in React.
8. **Fill in the blank** — combines vocab bank + generation + answer checking.
9. **Conversation** — most complex: multi-turn AI chat in Mandarin. Concepts: chat/message state, streaming responses.

Each milestone starts with a short design discussion (what needs to be true before we build it), then the user implements while I explain concepts as they hit them, then we review together.

## Immediate next step
Confirm the Next.js-only (vs. separate React + Next.js) stack decision with the user, then start Milestone 1: scaffold the project and have the user build the first simple page themselves, with me explaining App Router/component basics as we go.

## Verification
No code is being written by me. "Testing" in this engagement means: the user runs `npm run dev` (or equivalent) after each milestone and demonstrates the feature working in-browser; I review the resulting code read-only and flag issues/teach concepts, but do not edit files.