from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_standings(db: Session = Depends(get_db)):
    groups = db.query(models.Group).all()
    teams = db.query(models.Team).all()
    matches = db.query(models.Match).filter(models.Match.status == models.MatchStatus.FINISHED).all()

    # Estructura inicial: { group_id: { team_id: { name, pts, pj, pg, pe, pp, gf, gc, gd } } }
    standings = {}
    for g in groups:
        standings[g.id] = {
            "name": g.name,
            "teams": []
        }
        group_teams = [t for t in teams if t.group_id == g.id]
        team_stats = {}
        for t in group_teams:
            team_stats[t.id] = {
                "name": t.name,
                "flag": t.flag_url,
                "pj": 0, "pg": 0, "pe": 0, "pp": 0,
                "gf": 0, "gc": 0, "gd": 0, "pts": 0
            }
        
        # Procesar partidos finalizados en este grupo
        for m in matches:
            if m.home_team_id in team_stats and m.away_team_id in team_stats:
                h = team_stats[m.home_team_id]
                a = team_stats[m.away_team_id]
                
                h["pj"] += 1
                a["pj"] += 1
                h["gf"] += m.home_score
                h["gc"] += m.away_score
                a["gf"] += m.away_score
                a["gc"] += m.home_score
                
                if m.home_score > m.away_score:
                    h["pg"] += 1; h["pts"] += 3
                    a["pp"] += 1
                elif m.home_score < m.away_score:
                    a["pg"] += 1; a["pts"] += 3
                    h["pp"] += 1
                else:
                    h["pe"] += 1; h["pts"] += 1
                    a["pe"] += 1; a["pts"] += 1
                
                h["gd"] = h["gf"] - h["gc"]
                a["gd"] = a["gf"] - a["gc"]

        # Ordenar equipos por puntos, luego diferencia de gol
        sorted_teams = sorted(team_stats.values(), key=lambda x: (x["pts"], x["gd"], x["gf"]), reverse=True)
        standings[g.id]["teams"] = sorted_teams

    return standings
