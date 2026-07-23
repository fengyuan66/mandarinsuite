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

Target characters (use only 2-4, and only where they form real, natural words): {sample}

Rules:
* Every word must be a REAL, existing Mandarin word — never invent one, and never swap in a target character just because it looks or sounds similar to the character a real word actually needs (e.g. don't write 磁器 when the real word is 瓷器 — 磁 and 瓷 are different characters). If a target character doesn't cleanly form a real word here, use it alone as a single-character word instead, or leave it out — never force a fabricated combination.
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
