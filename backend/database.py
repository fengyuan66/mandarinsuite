import os
from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel

load_dotenv()

database_url = os.getenv("DATABASE_URL", "sqlite:///./mandarinsuite.db")
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)

def engine_create_tables():
    SQLModel.metadata.create_all(engine)