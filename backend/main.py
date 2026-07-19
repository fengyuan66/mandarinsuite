from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from database import engine_create_tables
from routers import characterbank
from routers import discover
from routers import cohort
from routers import practicelog
from routers import round
from routers import unit
from routers import generation
from routers import admin
from routers import auth


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(characterbank.router)
app.include_router(discover.router)
app.include_router(cohort.router)
app.include_router(practicelog.router)
app.include_router(round.router)
app.include_router(unit.router)
app.include_router(generation.router)
app.include_router(admin.router)
app.include_router(auth.router)

@app.on_event("startup")
def on_startup():
    engine_create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code = 500, content={"error": True, "message": "Something went wrong! Please try again"})