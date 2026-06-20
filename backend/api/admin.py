from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List, Optional
import bcrypt

router = APIRouter()

# DTOs
class UserCreateAdmin(BaseModel):
    username: str
    email: str
    password: str

class PhaseCreate(BaseModel):
    name: str

class GroupCreate(BaseModel):
    name: str
    phase_id: int

class TeamCreate(BaseModel):
    name: str
    flag_url: Optional[str] = None
    group_id: Optional[int] = None

class MatchCreate(BaseModel):
    home_team_id: int
    away_team_id: int
    phase_id: int
    date: str
    stadium: str

class MatchResult(BaseModel):
    home_score: int
    away_score: int

# ========================
# CRUD ENTIDADES
# ========================

@router.post("/users")
def admin_create_user(user: UserCreateAdmin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    new_user = models.User(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "Usuario creado con éxito"}

@router.post("/phases")
def create_phase(phase: PhaseCreate, db: Session = Depends(get_db)):
    new_phase = models.Phase(name=phase.name)
    db.add(new_phase)
    db.commit()
    return {"message": "Fase creada"}

@router.post("/groups")
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    new_group = models.Group(name=group.name, phase_id=group.phase_id)
    db.add(new_group)
    db.commit()
    return {"message": "Grupo creado"}

@router.post("/teams")
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    new_team = models.Team(name=team.name, flag_url=team.flag_url, group_id=team.group_id)
    db.add(new_team)
    db.commit()
    return {"message": "Equipo creado"}

@router.post("/matches")
def create_match(match: MatchCreate, db: Session = Depends(get_db)):
    # Prevent duplicate match in same phase
    existing = db.query(models.Match).filter(
        models.Match.home_team_id == match.home_team_id,
        models.Match.away_team_id == match.away_team_id,
        models.Match.phase_id == match.phase_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Este partido ya existe en esta fase.")

    new_match = models.Match(
        home_team_id=match.home_team_id,
        away_team_id=match.away_team_id,
        phase_id=match.phase_id,
        date=match.date,
        stadium=match.stadium
    )
    db.add(new_match)
    db.commit()
    return {"message": "¡Partido programado con éxito!"}

@router.put("/matches/{match_id}/result")
def update_match_result(match_id: int, result: MatchResult, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    
    match.home_score = result.home_score
    match.away_score = result.away_score
    match.status = models.MatchStatus.FINISHED
    db.commit()
    db.refresh(match)  # Ensure we read back the committed values before scoring

    from logic.scoring import calculate_points
    predictions = db.query(models.Prediction).filter(models.Prediction.match_id == match_id).all()
    for pred in predictions:
        pred.points_earned = calculate_points(
            match.home_score, match.away_score,
            pred.home_prediction, pred.away_prediction
        )
    db.commit()
    return {"message": f"Resultado guardado: {match.home_score}-{match.away_score}. Puntos calculados para {len(predictions)} predicciones."}

# ========================
# LOOKUPS (Para los selects)
# ========================
@router.get("/lookups")
def get_lookups(db: Session = Depends(get_db)):
    phases = db.query(models.Phase).all()
    groups = db.query(models.Group).all()
    teams = db.query(models.Team).all()
    # Also fetch pending matches for the results tab
    pending_matches = db.query(models.Match).filter(models.Match.status == models.MatchStatus.SCHEDULED).all()
    all_matches = db.query(models.Match).all()
    
    return {
        "phases": [{"id": p.id, "name": p.name} for p in phases],
        "groups": [{"id": g.id, "name": g.name, "phase_id": g.phase_id} for g in groups],
        "teams": [{"id": t.id, "name": t.name, "group_id": t.group_id} for t in teams],
        "pending_matches": [
            {
                "id": m.id, 
                "name": f"{m.home_team.name if m.home_team else '?'} vs {m.away_team.name if m.away_team else '?'}", 
                "date": (m.date.isoformat() + "Z") if m.date and hasattr(m.date, 'isoformat') else (f"{m.date}Z" if m.date else None),
                "phase_id": m.phase_id,
                "group_id": m.home_team.group_id if m.home_team else None
            } for m in pending_matches
        ],
        "all_matches": [
            {
                "id": m.id,
                "home": m.home_team.name if m.home_team else '?',
                "away": m.away_team.name if m.away_team else '?',
                "phase": m.phase.name if m.phase else '?',
                "status": str(m.status),
                "date": (m.date.isoformat() + "Z") if m.date and hasattr(m.date, 'isoformat') else (f"{m.date}Z" if m.date else None)
            } for m in all_matches
        ]
    }
