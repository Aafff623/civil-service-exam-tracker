from flask import Blueprint, jsonify
from routes.auth import login_required
from db import get_db

bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')


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
            "weight": float(row['weight']),
            "difficulty": float(row['difficulty'])
        })

    return jsonify({"success": True, "data": {"items": items}, "message": ""}), 200