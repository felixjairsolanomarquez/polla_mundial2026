from sqlalchemy import create_engine, text
import os

engine = create_engine('mysql+mysqlconnector://root:@localhost:3306/polla_db')
with engine.connect() as conn:
    trans = conn.begin()
    try:
        # Update matching DB enum literal 'SCHEDULED'
        res = conn.execute(text("UPDATE matches SET status = 'SCHEDULED' WHERE status != 'FINISHED' OR status IS NULL"))
        print(f"Updated {res.rowcount} rows to 'SCHEDULED'")
        
        # Verify
        res = conn.execute(text("SELECT id, status FROM matches"))
        print("Current matches status:")
        for r in res:
            print(f"ID {r[0]}: {r[1]}")
            
        trans.commit()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")
        trans.rollback()
