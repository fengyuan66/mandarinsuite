from dotenv import load_dotenv
import os
from passlib.context import CryptContext
from fastapi_login import LoginManager
from sqlmodel import Session, select
from database import engine
from models.user import User

load_dotenv()
SECRET_KEY = os.getenv("AUTH_SECRET_KEY")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

manager = LoginManager(SECRET_KEY, token_url="/auth/login", use_cookie=True)
manager.cookie_name = "mandarinsuite_auth"

@manager.user_loader()
def load_user(email: str):
    with Session(engine) as session:
        return session.exec(select(User).where(User.email == email)).first()