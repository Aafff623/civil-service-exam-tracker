# Database models and helper functions
# Table definitions are in init_db.sql

from datetime import datetime

def serialize_row(row):
    """Convert sqlite3.Row to dict."""
    if row is None:
        return None
    return {key: row[key] for key in row.keys()}

def now_iso():
    return datetime.utcnow().isoformat()
