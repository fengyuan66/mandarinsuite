from sqlmodel import create_engine, SQLModel

sqlite_url = "sqlite:///./mandarinsuite.db"
engine = create_engine(sqlite_url)
def engine_create_tables():
    SQLModel.metadata.create_all(engine)