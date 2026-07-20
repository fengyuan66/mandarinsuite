from dotenv import load_dotenv
import os
import json
from groq import Groq

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

def ai(msg, model: str = "openai/gpt-oss-120b"):
    client = Groq(api_key=groq_api_key)

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": msg}],
    )

    content = response.choices[0].message.content
    print (f"[AI RAW INPUT] input = {msg}")
    print(f"[AI RAW OUTPUT] model={model} output={content!r}")

    return content


def safe_ai(msg, model: str = "openai/gpt-oss-120b"):
    try:
        return ai(msg, model)
    except Exception:
        return None
    
def safe_ai_json(msg, model: str = "openai/gpt-oss-120b"):
    text = safe_ai(msg, model)
    if text is None:
        return None
    try: 
        return json.loads(text)
    except json.JSONDecodeError:
        return None