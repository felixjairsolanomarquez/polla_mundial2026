import sqlite3
import os

db_path = 'd:/FELIX/DESARROLLO/POLLA/backend/polla.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} no existe")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tablas encontradas: {tables}")
    for table in tables:
        name = table[0]
        if name.startswith('sqlite_'): continue
        cursor.execute(f"SELECT count(*) FROM `{name}`")
        count = cursor.fetchone()[0]
        print(f"Tabla: {name}, Registros: {count}")
    conn.close()
