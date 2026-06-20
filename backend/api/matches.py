from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_matches(db: Session = Depends(get_db)):
    matches = db.query(models.Match).all()
    
    result = []
    for m in matches:
        home_team = m.home_team
        away_team = m.away_team
        phase_name = m.phase.name if m.phase else "Fase"
        
        # Opcional: mostrar grupo si están en la misma fase de grupos
        group_indicator = ""
        if home_team.group and away_team.group and home_team.group_id == away_team.group_id:
            group_indicator = f" ({home_team.group.name})"
            
        # Serialize date as ISO string with Z suffix so JS new Date() parses it correctly as UTC
        date_str = (m.date.isoformat() + "Z") if m.date and hasattr(m.date, 'isoformat') else (str(m.date) + "Z" if m.date else None)

        result.append({
            "id": m.id,
            "homeTeam": {
                "id": home_team.id,
                "name": home_team.name,
                "flag": home_team.flag_url
            },
            "awayTeam": {
                "id": away_team.id,
                "name": away_team.name,
                "flag": away_team.flag_url
            },
            "phase": f"{phase_name}{group_indicator}",
            "stadium": m.stadium,
            "date": date_str,
            "home_score": m.home_score,
            "away_score": m.away_score,
            "status": m.status
        })
        
    return result
