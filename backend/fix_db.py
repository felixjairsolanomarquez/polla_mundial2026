from database import engine
from sqlalchemy import text
import models

def fix():
    with engine.connect() as conn:
        tr = conn.begin()
        # Forzar estado pending en nulos o vacíos
        conn.execute(text("UPDATE matches SET status = 'pending' WHERE status IS NULL OR status = ''"))
        tr.commit()
        print("Corrección de estados completada.")

if __name__ == "__main__":
    fix()
