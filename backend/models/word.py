# Wordbank Database Model:

class Word(WordBase):
    
    hanzi: str
    pinyin: str
    meaning: str
    strokec: int

class Word(WordBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)