from fastapi import APIRouter
from sqlmodel import SQLModel
from database import engine

router = APIRouter()

@router.delete("/admin/wipe")
def wipe_all_data():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    return {"dropped": True}