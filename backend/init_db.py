from database import engine
from models import Base

def init_db():
    print("Conectando a la base de datos y creando tablas...")
    try:
        # Esto creará todas las tablas definidas en models.py
        Base.metadata.create_all(bind=engine)
        print("¡Tablas creadas exitosamente!")
    except Exception as e:
        print(f"Error al configurar la base de datos: {e}")
        print("\nRECUERDA: Debes crear la base de datos 'polla_db' manualmente en MySQL primero.")

if __name__ == "__main__":
    init_db()
