import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def check_mysql():
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    host = os.getenv("MYSQL_HOST", "localhost")
    port = int(os.getenv("MYSQL_PORT", 3306))
    db_name = os.getenv("MYSQL_DB", "polla_db")

    print(f"Intentando conectar a MySQL: {user}@{host}:{port}/{db_name}")
    
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=db_name,
            port=port
        )
        cursor = conn.cursor()
        
        tables = ['phases', 'groups', 'teams', 'matches', 'users', 'predictions']
        for table in tables:
            try:
                cursor.execute(f"SELECT count(*) FROM `{table}`")
                count = cursor.fetchone()[0]
                print(f"Tabla: {table}, Registros: {count}")
            except Exception as e:
                print(f"Error en tabla {table}: {e}")
        
        # Si hay datos, vamos a generar el dump directamente
        if any(True for table in tables): # Solo una prueba
             print("\nGenerando dump de datos...")
             with open('d:/FELIX/DESARROLLO/POLLA/backend/data_from_mysql.sql', 'w', encoding='utf-8') as f:
                f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")
                for table in tables:
                    try:
                        cursor.execute(f"SELECT * FROM `{table}`")
                        rows = cursor.fetchall()
                        if not rows: continue
                        
                        cursor.execute(f"SHOW COLUMNS FROM `{table}`")
                        columns = [col[0] for col in cursor.fetchall()]
                        cols_str = ", ".join([f"`{c}`" for c in columns])
                        
                        f.write(f"-- Data for {table}\n")
                        for row in rows:
                            values = []
                            for val in row:
                                if val is None:
                                    values.append("NULL")
                                elif isinstance(val, (str, bytes)):
                                    val_str = val if isinstance(val, str) else val.decode('utf-8', errors='ignore')
                                    val_esc = val_str.replace("'", "''")
                                    values.append(f"'{val_esc}'")
                                elif hasattr(val, 'isoformat'): # Para datetime
                                    values.append(f"'{val.isoformat()}'")
                                else:
                                    # Para fechas que vienen como strings en MySQL o ya formateadas
                                    val_str = str(val)
                                    if '-' in val_str and ':' in val_str: # Atajo para detectar fechas
                                        values.append(f"'{val_str}'")
                                    else:
                                        values.append(val_str)
                            f.write(f"INSERT INTO `{table}` ({cols_str}) VALUES ({', '.join(values)});\n")
                        f.write("\n")
                    except: continue
                f.write("SET FOREIGN_KEY_CHECKS = 1;\n")
             print("¡Dump generado en data_from_mysql.sql!")

        conn.close()
    except Exception as e:
        print(f"No se pudo conectar a MySQL local: {e}")

if __name__ == "__main__":
    check_mysql()
