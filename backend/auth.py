from dotenv import load_dotenv
import os
from passlib.context import CryptContext
from fastapi_login import LoginManager
from sqlmodel import Session, select
from database import engine
from models.user import User
from datetime import timedelta

load_dotenv()
SECRET_KEY = os.getenv("AUTH_SECRET_KEY")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

manager = LoginManager(SECRET_KEY, token_url="/auth/login", use_cookie=True,
default_expiry = timedelta(hours = 12))
manager.cookie_name = "mandarinsuite_auth"

IS_PRODUCTION = os.getenv("ENV", "development") == "production"

def cookie_kwargs() -> dict:
    # MAINTENANCE: Cross-site cookies (frontend and backend on different domains) require SameSite=None + Secure
    # Local development using http localhost needs SameSite=Lax instead!
    if IS_PRODUCTION:
        return {"httponly": True, "secure": True, "samesite": "none"}
    return {"httponly": True, "secure": False, "samesite": "lax"}

@manager.user_loader()
def load_user(email: str):
    with Session(engine) as session:
        return session.exec(select(User).where(User.email == email)).first()