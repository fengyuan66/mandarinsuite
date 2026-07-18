from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel
from database import engine
from models.user import User
from auth import manager

router = APIRouter()

ADMIN_EMAIL = "siyajing128@gmail.com"

@router.delete("/admin/wipe")
def wipe_all_data(user: User = Depends(manager)):
    if user.email != ADMIN_EMAIL:
        raise HTTPException(403, "Not allowed")
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    return {"dropped": True}