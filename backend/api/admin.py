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

class UserPasswordUpdate(BaseModel):
    new_password: str

class PhaseCreate(BaseModel):
    name: str
    type: Optional[str] = "POINTS"

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
    try:
        phase_type_enum = models.PhaseType(phase.type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Tipo de fase inválido. Debe ser 'POINTS' o 'KNOCKOUT'")
    new_phase = models.Phase(name=phase.name, type=phase_type_enum)
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
# PROGRESIÓN DE FASES Y CLASIFICADOS
# ========================

class ResolvePhasePayload(BaseModel):
    phase_id: int
    advancing_team_ids: List[int]

class TeamStatusUpdate(BaseModel):
    team_id: int
    is_eliminated: bool

class TeamStatusBatchPayload(BaseModel):
    updates: List[TeamStatusUpdate]

@router.get("/phases/{phase_id}/standings-candidates")
def get_standings_candidates(phase_id: int, db: Session = Depends(get_db)):
    phase = db.query(models.Phase).filter(models.Phase.id == phase_id).first()
    if not phase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    
    # 1. Obtener grupos y sus equipos vinculados a esta fase
    groups = db.query(models.Group).filter(models.Group.phase_id == phase_id).all()
    teams = db.query(models.Team).all()
    matches = db.query(models.Match).filter(
        models.Match.phase_id == phase_id, 
        models.Match.status == models.MatchStatus.FINISHED
    ).all()
    
    # Calcular posiciones por grupo similar a standings.py
    standings_by_group = []
    third_placed_teams = []
    all_teams_in_phase_ids = []
    
    for g in groups:
        group_teams = [t for t in teams if t.group_id == g.id]
        team_stats = {}
        for t in group_teams:
            all_teams_in_phase_ids.append(t.id)
            team_stats[t.id] = {
                "id": t.id,
                "name": t.name,
                "flag": t.flag_url,
                "group_name": g.name,
                "pj": 0, "pg": 0, "pe": 0, "pp": 0,
                "gf": 0, "gc": 0, "gd": 0, "pts": 0
            }
            
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
                
        sorted_group = sorted(team_stats.values(), key=lambda x: (x["pts"], x["gd"], x["gf"]), reverse=True)
        standings_by_group.append({
            "group_id": g.id,
            "group_name": g.name,
            "teams": sorted_group
        })
        
        # El tercero de cada grupo va a la lista de candidatos a mejores terceros
        if len(sorted_group) >= 3:
            third_placed_teams.append(sorted_group[2])
            
    # Ordenar los terceros colocados por su rendimiento general
    sorted_thirds = sorted(third_placed_teams, key=lambda x: (x["pts"], x["gd"], x["gf"]), reverse=True)
    
    # Determinar candidatos recomendados
    # 1. Pasan los 2 primeros puestos de cada grupo automáticamente
    auto_qualifiers = []
    auto_eliminated = []
    
    for g_stand in standings_by_group:
        # Pasan los 2 primeros si hay equipos suficientes
        if len(g_stand["teams"]) >= 1:
            auto_qualifiers.append(g_stand["teams"][0]["id"])
        if len(g_stand["teams"]) >= 2:
            auto_qualifiers.append(g_stand["teams"][1]["id"])
        # Los cuartos (o menores) recomendados a eliminar
        if len(g_stand["teams"]) > 3:
            for extra_team in g_stand["teams"][3:]:
                auto_eliminated.append(extra_team["id"])
                
    # 2. De los terceros colocados, recomendamos clasificar a los mejores 8 (Regla Mundial 48 equipos)
    recommended_thirds_ids = [t["id"] for t in sorted_thirds[:8]]
    eliminated_thirds_ids = [t["id"] for t in sorted_thirds[8:]]
    
    recommended_advancing = auto_qualifiers + recommended_thirds_ids
    recommended_eliminated = auto_eliminated + eliminated_thirds_ids
    
    return {
        "groups": standings_by_group,
        "thirds": sorted_thirds,
        "recommended_advancing": recommended_advancing,
        "recommended_eliminated": recommended_eliminated,
        "all_team_ids": all_teams_in_phase_ids
    }

@router.post("/resolve-phase")
def resolve_phase(payload: ResolvePhasePayload, db: Session = Depends(get_db)):
    phase = db.query(models.Phase).filter(models.Phase.id == payload.phase_id).first()
    if not phase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
        
    # Obtener todos los grupos en esta fase
    groups = db.query(models.Group).filter(models.Group.phase_id == payload.phase_id).all()
    group_ids = [g.id for g in groups]
    
    teams_in_phase = []
    if group_ids:
        # Equipos que pertenecen a los grupos de esta fase
        teams_in_phase = db.query(models.Team).filter(models.Team.group_id.in_(group_ids)).all()
    else:
        # Fallback: equipos que jugaron en esta fase
        home_ids = db.query(models.Match.home_team_id).filter(models.Match.phase_id == payload.phase_id).distinct()
        away_ids = db.query(models.Match.away_team_id).filter(models.Match.phase_id == payload.phase_id).distinct()
        team_ids = list(set([r[0] for r in home_ids.all() + away_ids.all()]))
        teams_in_phase = db.query(models.Team).filter(models.Team.id.in_(team_ids)).all()
        
    if not teams_in_phase:
        raise HTTPException(status_code=400, detail="No se encontraron equipos asociados a esta fase.")
        
    for team in teams_in_phase:
        if team.id in payload.advancing_team_ids:
            team.is_eliminated = False
        else:
            team.is_eliminated = True
            
    db.commit()
    return {"message": f"Fase resuelta con éxito. Se confirmaron {len(payload.advancing_team_ids)} clasificados y se eliminaron {len(teams_in_phase) - len(payload.advancing_team_ids)} equipos."}

@router.post("/teams/batch-status")
def batch_update_teams_status(payload: TeamStatusBatchPayload, db: Session = Depends(get_db)):
    updated_count = 0
    for update in payload.updates:
        team = db.query(models.Team).filter(models.Team.id == update.team_id).first()
        if team:
            team.is_eliminated = update.is_eliminated
            updated_count += 1
    db.commit()
    return {"message": f"Se actualizó el estado de {updated_count} equipos con éxito."}

# ========================
# LOOKUPS (Para los selects)
# ========================
@router.get("/lookups")
def get_lookups(db: Session = Depends(get_db)):
    phases = db.query(models.Phase).all()
    groups = db.query(models.Group).all()
    teams = db.query(models.Team).all()
    users = db.query(models.User).all()
    # Fetch all matches for the results tab so admin can re-score FINISHED matches
    # Fetch matches that are not finished for the results tab
    pending_matches = db.query(models.Match).filter(models.Match.status != models.MatchStatus.FINISHED).order_by(models.Match.date.asc()).all()
    all_matches = db.query(models.Match).all()
    
    return {
        "phases": [{"id": p.id, "name": p.name, "type": p.type.value if hasattr(p.type, 'value') else p.type} for p in phases],
        "groups": [{"id": g.id, "name": g.name, "phase_id": g.phase_id} for g in groups],
        "teams": [{"id": t.id, "name": t.name, "group_id": t.group_id, "is_eliminated": t.is_eliminated} for t in teams],
        "users": [{"id": u.id, "username": u.username, "email": u.email, "is_admin": u.is_admin} for u in users],
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

@router.put("/users/{user_id}/password")
def change_user_password(user_id: int, payload: UserPasswordUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(payload.new_password.encode('utf-8'), salt).decode('utf-8')
    user.password_hash = hashed_password
    db.commit()
    return {"message": f"Contraseña del usuario {user.username} actualizada con éxito"}
