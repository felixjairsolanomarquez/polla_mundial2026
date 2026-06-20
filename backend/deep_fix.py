from database import SessionLocal
import models

def deep_fix_orm():
    db = SessionLocal()
    try:
        matches = db.query(models.Match).all()
        print(f"Total partidos en BD: {len(matches)}")
        for m in matches:
            print(f"ID {m.id}: Status Crudo='{m.status}'")
            if not m.status or m.status == "" or m.status == "None":
                print(f"  -> Corrigiendo ID {m.id} a PENDING")
                m.status = models.MatchStatus.PENDING
        
        db.commit()
        print("Commit exitoso.")
        
        # Verificar despues del commit
        db.refresh(matches[0])
        print(f"ID {matches[0].id} post-fix: '{matches[0].status}'")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    deep_fix_orm()
