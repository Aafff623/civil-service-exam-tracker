import os

from config import Config
from db import get_mysql_connection


def load_sql_statements(path):
    lines = []
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            stripped = line.strip()
            if stripped.startswith('--') or not stripped:
                continue
            lines.append(line)
    sql = ''.join(lines)
    return [stmt.strip() for stmt in sql.split(';') if stmt.strip()]


def init_db():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(base_dir, '..', 'frontend', 'assets', 'init_db.sql')

    conn = get_mysql_connection()
    cursor = conn.cursor()
    cursor.execute(
        f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DATABASE}` "
        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    conn.select_db(Config.MYSQL_DATABASE)

    for stmt in load_sql_statements(sql_path):
        cursor.execute(stmt)

    conn.commit()
    cursor.close()
    conn.close()
    print(f"Initialized MySQL database: {Config.MYSQL_DATABASE} on {Config.MYSQL_HOST}:{Config.MYSQL_PORT}")
    print(f"SQL source: {os.path.normpath(sql_path)}")


if __name__ == '__main__':
    init_db()