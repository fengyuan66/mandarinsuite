from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from sqlmodel import Session, select
from database import engine
from models.user import User
from auth import manager, hash_password, verify_password

router = APIRouter()

class AuthBody(BaseModel):
    email: str
    password: str

@router.post("/auth/register")
def register(body: AuthBody):
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == body.email)).first()
        if existing:
            raise HTTPException(400, "Email already registered")
        user = User(email=body.email, hashed_password=hash_password(body.password))
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"id": user.id, "email": user.email}

@router.post("/auth/login")
def login(body: AuthBody, response: Response):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == body.email)).first()
        if user is None or not verify_password(body.password, user.hashed_password):
            raise HTTPException(401, "Invalid email or password")
        token = manager.create_access_token(data={"sub": user.email})
        manager.set_cookie(response, token)
        return {"id": user.id, "email": user.email}

@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(manager.cookie_name)
    return {"logged_out": True}

@router.get("/auth/me")
def me(user: User = Depends(manager)):
    return {"id": user.id, "email": user.email}