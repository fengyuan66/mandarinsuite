import json
from pathlib import Path

datapath = Path(__file__).parent /"hanzi_dictionary.json"
dictionary = json.loads(datapath.read_text(encoding="utf-8"))

def lookup_hanzi(hanzi: str) -> dict | None:
    return dictionary.get(hanzi)