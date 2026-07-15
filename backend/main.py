from fastapi import FastAPI
from database import engine_create_tables
from routers import characterbank
from routers import discover
from routers import cohort
from routers import practicelog
from routers import round
from routers import unit

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(characterbank.router)
app.include_router(discover.router)
app.include_router(cohort.router)
app.include_router(practicelog.router)
app.include_router(round.router)
app.include_router(unit.router)

@app.on_event("startup")
def on_startup():
    engine_create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)