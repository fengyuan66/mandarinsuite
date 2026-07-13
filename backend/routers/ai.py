from dotenv import load_dotenv
import os

from groq import Groq

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

def ai(model, msg):
    client = Groq(api_key=groq_api_key)

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": msg}],
    )

    return response.choices[0].message.content