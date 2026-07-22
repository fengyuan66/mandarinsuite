from dotenv import load_dotenv
import os
import json
from groq import Groq

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

def ai(msg, model: str = "openai/gpt-oss-120b", temperature: float = 1.0, response_format: dict | None = None):
    client = Groq(api_key=groq_api_key)

    kwargs = {}
    if response_format is not None:
        kwargs["response_format"] = response_format

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": msg}],
        temperature=temperature,
        **kwargs,
    )

    content = response.choices[0].message.content
    print (f"[AI RAW INPUT] input = {msg}")
    print(f"[AI RAW OUTPUT] model={model} output={content!r}")

    return content


def safe_ai(prompt, model: str = "openai/gpt-oss-120b", temperature: float = 1.0, response_format: dict | None = None):
    
    try:
        return ai(prompt, model, temperature=temperature, response_format=response_format)
    except Exception:
        return None
    
def safe_ai_json(msg, model: str = "openai/gpt-oss-120b"):
    text = safe_ai(msg, model, temperature=0.4, response_format={"type": "json_object"})
    if text is None:
        return None
    try: 
        return json.loads(text)
    except json.JSONDecodeError:
        return None