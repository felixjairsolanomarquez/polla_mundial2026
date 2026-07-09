import os
import sys
from sqlalchemy import text
from database import engine

def migrate():
    print("Iniciando migración de base de datos...")
    
    # Determinar motor de BD
    db_type = engine.url.drivername
    print(f"Tipo de base de datos detectado: {db_type}")
    
    with engine.connect() as conn:
        # 1. Migración para la tabla 'teams' -> columna 'is_eliminated'
        # Verificar si columna existe
        try:
            if "sqlite" in db_type:
                # Obtener información de la tabla en SQLite
                columns_info = conn.execute(text("PRAGMA table_info(teams)")).fetchall()
                column_names = [col[1] for col in columns_info]
            else:
                # Obtener información de la tabla en MySQL
                columns_info = conn.execute(text("SHOW COLUMNS FROM teams")).fetchall()
                column_names = [col[0] for col in columns_info]
                
            if "is_eliminated" not in column_names:
                print("Agregando columna 'is_eliminated' a la tabla 'teams'...")
                if "sqlite" in db_type:
                    # SQLite no soporta BOOLEAN DEFAULT 0 NOT NULL directamente si hay registros existentes sin un default simple, pero ALTER TABLE ADD es simple
                    conn.execute(text("ALTER TABLE teams ADD COLUMN is_eliminated BOOLEAN DEFAULT 0 NOT NULL"))
                else:
                    conn.execute(text("ALTER TABLE teams ADD COLUMN is_eliminated TINYINT(1) DEFAULT 0 NOT NULL"))
                print("¡Columna 'is_eliminated' agregada con éxito!")
            else:
                print("La columna 'is_eliminated' ya existe en la tabla 'teams'.")
        except Exception as e:
            print(f"Error al migrar la tabla 'teams': {e}", file=sys.stderr)
            
        # 2. Migración para la tabla 'phases' -> columna 'type'
        try:
            if "sqlite" in db_type:
                columns_info = conn.execute(text("PRAGMA table_info(phases)")).fetchall()
                column_names = [col[1] for col in columns_info]
            else:
                columns_info = conn.execute(text("SHOW COLUMNS FROM phases")).fetchall()
                column_names = [col[0] for col in columns_info]
                
            if "type" not in column_names:
                print("Agregando columna 'type' a la tabla 'phases'...")
                if "sqlite" in db_type:
                    conn.execute(text("ALTER TABLE phases ADD COLUMN type VARCHAR(50) DEFAULT 'POINTS' NOT NULL"))
                else:
                    # Usamos VARCHAR(50) para ser compatibles y seguros sin lidiar directamente con el Enum nativo de MySQL en el ALTER TABLE
                    conn.execute(text("ALTER TABLE phases ADD COLUMN type VARCHAR(50) DEFAULT 'POINTS' NOT NULL"))
                print("¡Columna 'type' agregada con éxito!")
            else:
                print("La columna 'type' ya existe en la tabla 'phases'.")
        except Exception as e:
            print(f"Error al migrar la tabla 'phases': {e}", file=sys.stderr)
            
        conn.commit()
    print("Migración finalizada con éxito.")

if __name__ == "__main__":
    migrate()
