from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PredictionCreate(BaseModel):
    user_id: int
    match_id: int
    home_prediction: int
    away_prediction: int

@router.post("/")
def create_prediction(pred: PredictionCreate, db: Session = Depends(get_db)):
    # Verificar si el partido existe y no ha finalizado
    match = db.query(models.Match).filter(models.Match.id == pred.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    if match.status == models.MatchStatus.FINISHED:
        raise HTTPException(status_code=400, detail="El partido ya ha finalizado, no se pueden cambiar las apuestas")

    # Si ya existe una predicción del usuario para este partido, actualizarla
    existing = db.query(models.Prediction).filter(
        models.Prediction.user_id == pred.user_id,
        models.Prediction.match_id == pred.match_id
    ).first()

    if existing:
        existing.home_prediction = pred.home_prediction
        existing.away_prediction = pred.away_prediction
    else:
        new_pred = models.Prediction(**pred.dict())
        db.add(new_pred)
    
    db.commit()
    return {"message": "Predicción guardada con éxito"}

@router.get("/all")
def get_all_predictions(db: Session = Depends(get_db)):
    """Retorna todos los partidos con sus respectivas predicciones de cada usuario"""
    matches = db.query(models.Match).all()
    results = []
    
    for m in matches:
        match_preds = []
        for p in m.predictions:
            match_preds.append({
                "username": p.user.username,
                "home_prediction": p.home_prediction,
                "away_prediction": p.away_prediction,
                "points_earned": p.points_earned
            })
            
        # Serialize date as ISO string with Z suffix so JS new Date() parses it correctly as UTC
        date_str = (m.date.isoformat() + "Z") if m.date and hasattr(m.date, 'isoformat') else (str(m.date) + "Z" if m.date else None)

        results.append({
            "id": m.id,
            "home": m.home_team.name,
            "away": m.away_team.name,
            "home_score": m.home_score,
            "away_score": m.away_score,
            "status": m.status,
            "date": date_str,
            "predictions": match_preds
        })
        
    return results
