from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Cambia estos valores por los de tu configuración local o usa un archivo .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Si no hay DATABASE_URL, intentar construirla desde variables individuales
if not DATABASE_URL:
    mysql_user = os.getenv("MYSQL_USER")
    mysql_password = os.getenv("MYSQL_PASSWORD", "")
    mysql_host = os.getenv("MYSQL_HOST")
    mysql_port = os.getenv("MYSQL_PORT", "3306")
    mysql_db = os.getenv("MYSQL_DB")
    
    if mysql_user and mysql_host and mysql_db:
        DATABASE_URL = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}"

if DATABASE_URL:
    # Si hay URL de MySQL (Producción / Hostinger)
    # Se añade pool_pre_ping=True para evitar errores de conexión perdida
    engine = create_engine(DATABASE_URL, pool_recycle=3600, pool_pre_ping=True)
else:
    # Si no hay URL, usar SQLite local (Desarrollo)
    SQLALCHEMY_DATABASE_URL = "sqlite:///./polla.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
