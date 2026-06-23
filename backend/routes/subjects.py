from flask import Blueprint, jsonify
from routes.auth import login_required

bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')

def get_db():
    from flask import current_app
    import sqlite3
    conn = sqlite3.connect(current_app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

@bp.route('/', methods=['GET'])
@login_required
def list_subjects():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, parent_id, weight, difficulty FROM subjects ORDER BY id")
    rows = cursor.fetchall()
    conn.close()

    items = []
    for row in rows:
        items.append({
            "id": row['id'],
            "name": row['name'],
            "parent_id": row['parent_id'],
            "weight": row['weight'],
            "difficulty": row['difficulty']
        })

    return jsonify({"success": True, "data": {"items": items}, "message": ""}), 200
