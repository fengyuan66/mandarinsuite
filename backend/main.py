from fastapi import FastAPI
from database import engine_create_tables
from routers import wordbank


app = FastAPI()
app.include_router(wordbank.router)

@app.on_event("startup")
def on_startup():
    engine_create_tables()