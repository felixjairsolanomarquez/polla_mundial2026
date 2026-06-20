from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import engine, get_db
from api import matches, ranking

# Crear tablas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Polla FIFA 2026 API")

# Configurar CORS (Más permisivo para desarrollo y acceso móvil)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de la Polla FIFA 2026"}

# Registro de Routers
app.include_router(matches.router, prefix="/matches", tags=["matches"])
from api import predictions, standings
app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(standings.router, prefix="/standings", tags=["standings"])
app.include_router(ranking.router, prefix="/ranking", tags=["ranking"])
from api import auth
app.include_router(auth.router, prefix="/auth", tags=["auth"])
from api import admin
app.include_router(admin.router, prefix="/admin", tags=["admin"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
