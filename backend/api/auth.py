from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
from pydantic import BaseModel
import models
from database import get_db

router = APIRouter()

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    return {
        "message": "Login exitoso",
        "token": "fake-jwt-token-123",
        "id": db_user.id,
        "username": db_user.username,
        "is_admin": db_user.is_admin
    }
