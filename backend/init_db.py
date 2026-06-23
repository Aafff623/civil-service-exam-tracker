import sqlite3
import os
from config import Config

def init_db():
    db_path = Config.DATABASE
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")

    conn = sqlite3.connect(db_path)
    with open('init_db.sql', 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print(f"Initialized database: {db_path}")

if __name__ == '__main__':
    init_db()
