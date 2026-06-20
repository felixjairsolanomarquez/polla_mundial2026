from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class MatchStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    FINISHED = "FINISHED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete")

class Phase(Base):
    __tablename__ = "phases"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # e.g. "Fase de Grupos", "Octavos de Final"
    
    groups = relationship("Group", back_populates="phase", cascade="all, delete")
    matches = relationship("Match", back_populates="phase", cascade="all, delete")

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False) # e.g. "Grupo A"
    phase_id = Column(Integer, ForeignKey("phases.id"), nullable=False)
    
    phase = relationship("Phase", back_populates="groups")
    teams = relationship("Team", back_populates="group")

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    flag_url = Column(String(255))
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True) # Grupos son opcionales para la fase de eliminatorias
    
    group = relationship("Group", back_populates="teams")

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    phase_id = Column(Integer, ForeignKey("phases.id"), nullable=False)
    
    date = Column(DateTime, nullable=False)
    stadium = Column(String(100))
    
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED)

    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    phase = relationship("Phase", back_populates="matches")
    predictions = relationship("Prediction", back_populates="match", cascade="all, delete")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    home_prediction = Column(Integer, nullable=False)
    away_prediction = Column(Integer, nullable=False)
    points_earned = Column(Integer, default=0)

    user = relationship("User", back_populates="predictions")
    match = relationship("Match", back_populates="predictions")
