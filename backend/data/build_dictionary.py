import json
from pathlib import Path

data_dir = Path(__file__).parent

strokes_by_char = {}
with open(data_dir / "graphics_raw.txt", encoding="utf-8") as f:
    for line in f:
        entry = json.loads(line)
        strokes_by_char[entry["character"]] = len(entry["strokes"])

merged = {}
with open(data_dir / "dictionary_raw.txt", encoding="utf-8") as f:
    for line in f:
        entry = json.loads(line)
        char = entry["character"]
        pinyin_list = entry.get("pinyin") or []
        definition = entry.get("definition")
        strokec = strokes_by_char.get(char)

        if not pinyin_list or not definition or strokec is None:
            continue

        merged[char] = {
            "pinyin": pinyin_list[0],
            "meaning": definition.split("/")[0].strip(),
            "strokec": strokec,
        }

with open(data_dir / "hanzi_dictionary.json", "w", encoding="utf-8") as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(merged)} entries to hanzi_dictionary.json")