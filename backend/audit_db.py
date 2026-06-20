from database import engine
from sqlalchemy import text

def audit():
    with engine.connect() as conn:
        # Ver todos los partidos, sus equipos, fases y estados
        query = text("""
            SELECT m.id, h.name as home, a.name as away, p.name as phase, m.date, m.status, h.group_id
            FROM matches m
            JOIN teams h ON m.home_team_id = h.id
            JOIN teams a ON m.away_team_id = a.id
            JOIN phases p ON m.phase_id = p.id
        """)
        rows = conn.execute(query).fetchall()

        print("--- AUDITORIA DE PARTIDOS (MySQL) ---")
        for r in rows:
            print(f"ID: {r.id} | {r.home} vs {r.away} | Fase: {r.phase} | Fecha: {r.date} | Estado: {r.status} | GroupID: {r.group_id}")

if __name__ == "__main__":
    audit()
