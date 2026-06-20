from typing import Optional

def calculate_points(
    home_real: int, 
    away_real: int, 
    home_pred: int, 
    away_pred: int
) -> int:
    """
    Reglas de Puntuación:
    - 5 Puntos: Marcador Exacto (goles de ambos equipos coinciden).
    - 3 Puntos: Acertó Ganador o Empate (pero no el marcador exacto).
    - 0 Puntos: No acertó nada.
    """
    # 1. Marcador Exacto
    if home_real == home_pred and away_real == away_pred:
        return 5
    
    # 2. Cualquier otro caso (Falló el marcador exacto)
    return 0

# Ejemplo de uso en un endpoint de actualización de resultado
# def update_match_points(db, match_id: int, home_score: int, away_score: int):
#     match = db.query(Match).filter(Match.id == match_id).first()
#     match.home_score = home_score
#     match.away_score = away_score
#     match.status = MatchStatus.FINISHED
#     
#     predictions = db.query(Prediction).filter(Prediction.match_id == match_id).all()
#     for p in predictions:
#         p.points_earned = calculate_points(home_score, away_score, p.home_prediction, p.away_prediction)
#     
#     db.commit()
