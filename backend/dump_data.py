import sqlite3

def dump_to_sql(sqlite_file, output_file):
    conn = sqlite3.connect(sqlite_file)
    cursor = conn.cursor()
    
    tables = ['phases', 'groups', 'teams', 'matches', 'users', 'predictions']
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")
        
        for table in tables:
            f.write(f"-- Data for {table}\n")
            try:
                cursor.execute(f"SELECT * FROM {table}")
            except sqlite3.OperationalError:
                f.write(f"-- Table {table} not found\n\n")
                continue
                
            rows = cursor.fetchall()
            
            if not rows:
                f.write(f"-- No data in {table}\n\n")
                continue
                
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [col[1] for col in cursor.fetchall()]
            # Wrap table and column names in backticks for MySQL compatibility
            # Especially for reserved words like 'groups'
            cols_str = ", ".join([f"`{c}`" for c in columns])
            
            for row in rows:
                values = []
                for val in row:
                    if val is None:
                        values.append("NULL")
                    elif isinstance(val, str):
                        val_esc = val.replace("'", "''")
                        values.append(f"'{val_esc}'")
                    else:
                        values.append(str(val))
                
                f.write(f"INSERT INTO `{table}` ({cols_str}) VALUES ({', '.join(values)});\n")
            f.write("\n")
            
        f.write("SET FOREIGN_KEY_CHECKS = 1;\n")
    
    conn.close()

if __name__ == "__main__":
    dump_to_sql('d:/FELIX/DESARROLLO/POLLA/backend/polla.db', 'd:/FELIX/DESARROLLO/POLLA/backend/data_migration.sql')
    print("Exportado exitosamente a data_migration.sql")
