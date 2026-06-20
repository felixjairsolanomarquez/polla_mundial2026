from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_ranking(db: Session = Depends(get_db)):
    """
    Obtiene el ranking global sumando los puntos de cada usuario.
    """
    # Consulta: Sumar 'points_earned' por usuario desde la tabla de predicciones
    ranking_data = (
        db.query(
            models.User.username,
            func.sum(models.Prediction.points_earned).label("total_points")
        )
        .join(models.Prediction, models.User.id == models.Prediction.user_id, isouter=True)
        .group_by(models.User.id)
        .order_by(func.sum(models.Prediction.points_earned).desc())
        .all()
    )

    # Formatear la respuesta
    ranking = [
        {"position": index + 1, "username": row.username, "points": row.total_points or 0}
        for index, row in enumerate(ranking_data)
    ]
    
    return ranking
