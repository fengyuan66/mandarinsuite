from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel, field_validator
from sqlmodel import Session, select
from database import engine
from models.user import User
from auth import manager, hash_password, verify_password, cookie_kwargs

router = APIRouter()

class AuthBody(BaseModel):
    email: str
    password: str

    @field_validator("email", "password")
    @classmethod
    def reject_invalids(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Field cannot be blank")

        if any(character.isspace() for character in value):
            raise ValueError("Field cannot contain spaces")

        return value
    

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
        response.set_cookie(key=manager.cookie_name, value=token, **cookie_kwargs())
        return {"id": user.id, "email": user.email}

@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(manager.cookie_name, samesite=cookie_kwargs()["samesite"])
    return {"logged_out": True}

@router.get("/auth/me")
def me(user: User = Depends(manager)):
    return {"id": user.id, "email": user.email}