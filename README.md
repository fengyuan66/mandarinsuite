<p align="center">
    <img
    src="README-assets/Dragons.png"
    width="900"
    >
</p>

<sup>This was an alternative proposed logo, the dragons look like M.S (MandarinSuite)</sup>

# MandarinSuite

**A software suite to facilitate my Mandarin learning this summer and beyond**

>[!NOTE]
>**Reship notes**
>
>When reviewing, please:
>
>
>1. Wait for at least 60 second after entering the Demo URL before interacting with anything. You can read the README meanwhile :)
>2. After any interaction (e.g., button press), wait for at most 15 seconds, especially for generative elements. 
>3. If an error was to occur, please note what you did leading up to the error and describe what was on screen. This will help me better understand where the bug is, thanks :)
>4. The authentication system is cookie-based, please enable your cookies! Incog windows that reject cookies will not work for that reason through me testing
>
>Previous ship could not be processed because it was reported that register button did not work no matter how many times pressed. I concluded that there may be two problems: 
>
>1. Register guard missing
>Without the register button being disabled, pressing it in quick succession could result in a softlock where the account is created but one could not be directed to the start page. I've since added such a guard so this should no longer happen.
>
>2. Render server
>Due to my free plan on Render's backend hosting, the site will take up to a minute to load up. The site should say "Loading..." during the time but idk what happened
>
>The register mechanism seems to work when I tested it on mine and my dad's device. My friends also signed up

>[!TIP]
>If you'd rather skip to the important bits (due to long review queue), you can skip over the "For Me" and "For User" sections (Head down to For Reviewer and For Developers). However, I put some time into "For Me" as there is a genuine inspiration behind this project so for more context you know where to loop
>
>"For Developers" includes a list of "What was built"

>[!IMPORTANT]
>
>The site will take its sweet time (~ or < than 1 minute to load due to backend being hosted on Render free plan)
>
>Please be gentle with the buttons and wait for things to finish generating / loading. I got my boisterous friends to test them but culd still be a risk.
>
>Also, if the site fails for whatever reason, please do leave details regarding the failure and how you got to there. It will help me fix it later. However, if video demo is sufficient, I would greatly appreciate it if review could be continued via video demo (all of my friends are going to Polaris so I really wanna get approved to go)

# For me (Motivations)
**Why did I build this project?**

I immigrated to Canada when I was in grade 3. Prior to that, I attended school in China, where I actually excelled in language arts at the elementary school level.

I still remember that one time I went to the park a few months after my family's arrival in Canada. I talked to this older girl who had a younger brother and she talked about how her younger brother had became estranged to Mandarin, not only in terms of ability, but emotionally: he **hated it**.

To my ears at the time it was horror; it was like seeing someone without a nose. After all, Mandarin was the language I spent my whole life with and I could possibly imagine such an element being erased. I too had this concern and understood that my Mandarin would lack behind, sure, but I could never see a day when I too become estranged with Mandarin...

... And that day is today.

I'm now fluent in English, which don't get me wrong, is and will continue to be the dominant and primary language in my life. However, any time I speak to my family or read Mandarin-based research papers / articles, I have to use this language. In addition, having a second language is just cool. All my buddies who are going to Polaris speaks a second language, and I don't wanna be left out.

So that is why I built this project.

**Why this tech stack?**

>This project uses the following tech stack:
>
>- **Frontend** React + Vite
>- **Backend:** FastAPI (Python)
>----------------------------------
>- **Database** SQLite (local dev) / Postgres (for production)
>- **Authentication** FastAPI-login
>- **Hanzi display** [hanzi-writer ](https://github.com/chanind/hanzi-writer)
>- **Hanzi Database source material**  [Make-me-a-hanzi](https://github.com/skishore/makemeahanzi)
>
>- **Deployment:** Render (backend) + Vercel (Frontend) + Neon (Postgres database)

I had previously made a personal website using React + Vite. Because of this, **I was semi-confident when it came to the frontend, but I wanted to use this opportunity to build a project where I can explore the backend** (and as it turns out database), so that I can get familiar with a complete stack.

This project was chosen with the intention of being complete within 4 days of lockin or 20 hours, but things have blown this way over budget

**Why this design?**

Side note before I begin, which is a rationale behind this design:

**Learning a language in general involves these 4 areas**
- Reading
- Writing
- Listening

I have been trying to learn Mandarin for a long time. At first commanded by my mom, then in 2022 this effort was transferred under my initiative, where I need to figure out the logistics of, like learning anything, how to efficiently learn this language.

Last semester, I took a Mandarin class in my school, and over the course of a few months of repetition and discipline, my Mandarin went from spending 1 hour to write a 100-character "About me" to being able to write out basic conversations as they happen.

So yeah, the drills in MandarinSuite are inspireed by my teacher, Mr. Ip's meta. What you can do in Mandarinsuite currently is basically 65% of what I did for the entire semester.

The key here is discipline and repetition in a sustainable and meaningful way. The drills he held intentionally emphasised diverse areas of the same area (e.g., writing).

In addition, these drills happened every day, sometimes twice a day, plus homework. Now that the semester is over, I frankly can't pull myself up to do the same.

So in order to gain some of that discipline, **the idea of Mandarinsuite is to create a "toolbox" that eliminates the microfrictions when doing these drill solo**

For example, if I have a dictation, I would have to write out the pinyin on a piece of paper before covering up my practices and writing it. That means space allocation, that means I have to think about what's the next drill, that means listening is compromised. Mandarinsuite's utterance mechanism solves that, as simple as it might be

In fact, you could probably extend this intention to learning any other language! (Ooo teaser?!!)

## Big bugs I encountered while making this

I want to stop writing but I just checked readme guide and it said I should include this. This is expanded from my AI declaration

This project had to go through a lot of debugging, mainly from these 5 factors:
1. Many layers (units, rounds, cohorts) and their respective functions (adding units, for example) makes logic complicated and easy for sync issues that result in softlocks
2. AI is non-deterministic and can generate broken / undesirable things. It is important that broken outputs are safely handled, tuned, and distinguished from my code errors
3. I'm simply not good at it because this is my first time on this backend. Sometimes I fail to consider a logic mistake or I misinterpret a pattern.
4. Adding multiuser system midway through was a headache because everything needed to be scoped to the user level now and anything that wasn't was out of sync
5. Stale refresh issues were also prevelant, especially in the frontend where updating useEffect() was crucial for it to stay in sync with the everchanging backend

## Development timeline:

This project was planned to be 20 hours and completed in 4 days. However, it ended up being 50 hours and completed in 10 days... I couldn't remember the exact dates' activities so here's the journey from what I remembered

1. Decide on what stack to use, brainstorm, create model of character and characterbank, migrate to current router/model pattern
2. Connect backend db to frontend
3. Add AI character generation 
3. (3.5): listen everything's just built ontop of this character object so by making the endpoints for Character and Characterlist objects robust we are basically like 50% done (NO WE ARE NOT)
4. Add concepts like units, rounds, and cohorts and generalise AI generation to everything
5. Add more routers to robustly get-set each of these concepts and to facilitate frontend
6. Add more frontend using the new endpoints I just created
7. Find out there's a bunch of bugs so I go and fix everything up, splitting up AI generation in the process partly because I have to tune it for individual tasks (this goes on for 2-3 days)
7. (7.5): hmm maybe I should add multi-user auth. How do I do that? Oh shoot I need to migrate everything
8. Finally fixes most errors
9. Robustness test from Claude and my boisterous friends to make sure there's no bugs / robustness issue (like softlocking) left for review
10. Style everything up
11. Write this README and submit


# For user

*Enough! Show us what is even in there!*

**Heirarchy**

- **Unit** Contains a theme, has multiple rounds per unit
    - **Round** Contains a cohort
        - **Cohort** A set of Mandarin characters (Hanzi) relating to the theme of the Unit it's in

- **Characterbank** A list of all characters user has seen, a domain.

------------------------------------

**Walkthrough:**

- **Signup/Login** You get it, just use a normal email/password pls!

**A la carte (individual) practices**
- **Practice** Use the current cohort's hanzi, or put in your own. Practice them down X times on paper and quickly submit a log
- **Dictation** Use cohort's hanzi, or put in your own. Get the characters read out loud and see if you can write them down correctly
- **Reading** focusing on cohort's characters or your own, AI generates something for you to read
- **Sentence-Dictation** Dictation but with phrases
- **Stats** The settings page. See your units, cohorts, and characterbank there. BEWARE OF THE BIG RED BUTTON THAT WIPES YOUR DATA
- **Start** Tired of having the agency to go through individual practices? Totally fair! Have Mandarinsuite feed you new excercises and generate new units / cohorts automatically! You can just keep on practicing without interruptions (basically AI-directed learning)

**By the way, there is a secret pet feature on Dictation and Practice Dictation pages**

# For reviewer

Hello reviewer! You can review my project through 2 ways, depending on your time. However, in the video walkthrough I get to demo and explain some mechanisms in the project that would be difficult to explain via text without reference

**This project is a web-based project. It was tested to work on a modern browser**

## Video Review
>**https://youtu.be/-Frcy3R3iyc**

>There's a lot of niche things about the logic behind this project, so if walking through it is too tiring (given the huge review queue), here is a video. Feel free to play it at 2X speed (or whatever speed you'd like) with subtitles!


## Site Review

**Login**
You do not have to use your actual email / password to log in! For instance, you may sign up with the below credentials:

>**Email: review12345@gmail.com**

>**Password: review**

**Mandarin**

Not everyone has Mandarin typing installed, so here are some characters to copy/paste while testing:

- 天地山水日月星辰风云

- 春,夏,秋,冬,花,草,树,木,鸟,鱼

- 和平快乐

- 学,习,进,步

- 健康幸福

**Site**

You can view the site here: https://mandarinsuite.vercel.app/

> [!TIP]
> - My free Render plan means that the backend server will take up to a minute to boot up. If you haven't already, tt is recommended that you load up the site ~1 minute prior if you wish to go through the site because there were errors previously due to the boot.
> - Please be gentle with the buttons and wait for generations to finish! I've had my friends test this out but there may still be patchy areas where spamming can cause errors!
> - AI is non-deterministic, which means that it could make mistakes. I've tried my best to make them handle well, but if something goes wrong in generation, 99% of the time ctrl+shift+R (hard refresh) and click to try again will do the job. If it is something serious (I haven't seen one so far but hypothetically) you may want to wipe all data in Stats page

## Pictures

![alt text](/README-assets/Login.png)
![alt text](/README-assets/Dictation.png)
![alt text](/README-assets/Practice.png)

## AI declaration

I attached Claude Code to this project due to it being able to instantly get the full context of my project.

**1. Guide for new concepts**

As mentioned in my motivations, a big goal of this project for me is to build on my recent React frontend experience and have a "standard" full stack I can work with. For parts like backend or database, I would have Claude as a mentor who would be able to have a context of what is next and teach me with examples of new concepts. However, because I asked Claude to generalise and many parts of the development involve patterns, I am able to build parts on my own after some guidance, albeit sometimes with bugs (ex: creating unit and round data models after being led on cohort model). I feel like that this method genuinely made me work and learn more efficiently during this project. I wouldn't say I'm fluent in backend after this, but if I was to build another project using this stack I'd be confident enough to know my way around and draft autonomously.

**2. Debugging tool**

This project had to go through a lot of debugging, mainly from these 4 factors:
1. Many layers (units, rounds, cohorts) and their respective functions (adding units, for example) makes logic complicated and easy for sync issues that result in softlocks
2. AI is non-deterministic and can generate broken / undesirable things. It is important that broken outputs are safely handled and distinguished from my code errors
3. I'm simply not good at it because this is my first time on this backend. Sometimes I fail to consider a logic mistake or I misinterpret a pattern.


Along with my friends and myself, Claude's ability to simulate as a user and interact with the browser / send requests to backend server allowed it to check a lot of possible scenarios in this system with so many input possibilities (like water rinsing through a pipe system). Because it had full context to the code, it also made it easy for me to know exactly where the errors occured, why, and its implications. This saved me a lot of time and burnout on debugging

---

However, at the end of the day (save for a few instances, like the tedious job of small refactoring to every function when adding auth), every line of code was put into the editor by me with intention and understanding (no "Claude just implement this feature for me pls" / without care of code).

All inspiration, asset, or structural design was directed / created by me (Canva/Figma/paper plans)

So at the end of the day, I feel like that, with the intention put into it, this project is definitely not a sloppy one and I've definitely put 10 days of lockin efforts into this. 

# For developer

## Tech stack / What was this made with?

>This project uses the following tech stack:
>
>- **Frontend** React + Vite
>- **Backend:** FastAPI (Python)
>----------------------------------
>- **Database** SQLite (local dev) / Postgres (for production)
>- **Authentication** FastAPI-login
>- **Hanzi display** [hanzi-writer ](https://github.com/chanind/hanzi-writer)
>- **Hanzi Database source material**  [Make-me-a-hanzi](https://github.com/skishore/makemeahanzi)
>
>- **Deployment:** Render (backend) + Vercel (Frontend) + Neon (Postgres database)
>-----------------------------------
>- **IDE:** VSCode
>- **AI agent assist:** Claude Code Sonnet

## What was built

**Frontend pages**

- **Signup/Login** A functional signup / login page

- **Start** Mandarinsuite will use an interactive Wizard to feed user new excercises and generate new units / cohorts automatically. User can just keep on practicing without interruptions (AI-directed learning)

- Toggleable pet that reads you dictations.

**A la carte (individual) practices**
- **Practice page:** Use the current cohort's hanzi, or put in your own. Practice them down X times on paper and quickly submit a log
- **Dictation page:** Use cohort's hanzi, or put in your own. Get the characters read out loud and see if you can write them down correctly
- **Reading page:** focusing on cohort's characters or your own, AI generates something for you to read
- **Sentence-Dictation page:** Dictation but with phrases
- **Stats page:** The settings page. See your units, cohorts, and characterbank there. Be able to create new units or use AI to discover new characters. Wipe all your data with a single button


**Backend**

- **Units, rounds, cohorts as database objects:** Concepts connected by structure for an organized learning agenda. Backend logic to easily facilitate adding/removing/viewing objects
- **Hanzi character list:** reference database of ~9000 hanzi characters built from the Github repo "Write me a Hanzi"
- **Multiuser authentication system**
- **AI learning material generation:** Centralised use of lightweight LLM for generative elements. Involves fallback measures to prevent crash

## How to add onto this (Windows)

**Prerequisites**

- Python 3.11+
- Node.js 18+ and npm
- A Groq API key (Free tier is fine!)

**Setup (from repo root)**

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

Create a file `backend/.env` with:
```
GROQ_API_KEY=your_groq_api_key_here
AUTH_SECRET_KEY=any_random_string_here
```
(Leave `DATABASE_URL` unset to default to SQLite for local dev)

Run the server:
```bash
uvicorn main:app --reload
```
Backend is now live at `http://localhost:8000`

**Frontend**

```bash
cd frontend
npm install
npm run dev
```
Frontend is now live at `http://localhost:5173`

Now open up `http://localhost:5173` on a modern browser and you should be able to see it

It is important that you activate venv via `venv/Scripts/activate` from backend whenever you want to launch backend!

---
**Structure**

As mentioned, there are **many** room for improvement for this app! You can add your own drills that you would find to be good. You could even adapt this app to learning a different language, OR ALL OF THEM?!

Anyways, the file system is quite intuitive

You got frontend in frontend, backend in backend.

- **Frontend**

Common react pattern, Header is in Components folder. common folder includes JSX content that are mainly shared functions, backend API callers, and constants that are used across many different pages, authentication stuff, and shared css theme

In general, index.css defines the basics (say shapes or general sizes) of types of elements (buttons, h1 texts, labels, etc)

theme.css defines the particular color and decorations, like the theme of this site.

Individual pages may override or add onto these shared css. Page-dependent css can be found in /css. Their respective pages can be found in /Pages

- **Backend**

Database models are under /models

Routers to database are under /routers

Essentially, edit models to change the data's structure. Edit routers to change the handling of the data and see references when connecting frontend to backend
