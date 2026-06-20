from database import SessionLocal
from models import Team, Match, MatchStatus
from datetime import datetime, timedelta

def seed():
    db = SessionLocal()
    try:
        print("Sembrando datos iniciales...")

        # 1. Crear Equipos (Hosts)
        mexico = Team(name="México", flag_url="https://flagcdn.com/mx.svg")
        usa = Team(name="USA", flag_url="https://flagcdn.com/us.svg")
        canada = Team(name="Canadá", flag_url="https://flagcdn.com/ca.svg")
        
        db.add_all([mexico, usa, canada])
        db.commit()
        
        # 2. Crear Partidos de prueba
        partido1 = Match(
            home_team_id=mexico.id,
            away_team_id=usa.id,
            date=datetime.now() + timedelta(days=2),
            stadium="Estadio Azteca",
            phase="Grupo A",
            status=MatchStatus.SCHEDULED
        )
        
        partido2 = Match(
            home_team_id=canada.id,
            away_team_id=mexico.id,
            date=datetime.now() + timedelta(days=5),
            stadium="BC Place",
            phase="Grupo A",
            status=MatchStatus.SCHEDULED
        )

        db.add_all([partido1, partido2])
        db.commit()
        
        print("¡Datos sembrados con éxito!")
        print(f"Equipos creados: {db.query(Team).count()}")
        print(f"Partidos creados: {db.query(Match).count()}")

    except Exception as e:
        print(f"Error al sembrar datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
