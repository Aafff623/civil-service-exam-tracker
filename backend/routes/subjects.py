from flask import Blueprint, jsonify, request
from routes.auth import login_required, admin_required
from db import get_db
import pymysql

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


@bp.route('/', methods=['POST'])
@login_required
@admin_required
def create_subject():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()

    if not name:
        return jsonify({"success": False, "message": "请填写分类名称"}), 400
    if len(name) > 100:
        return jsonify({"success": False, "message": "分类名称过长"}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO subjects (name, parent_id, weight, difficulty) VALUES (%s, NULL, 1.0, 1.0)",
            (name,)
        )
        subject_id = cursor.lastrowid
        conn.commit()
        conn.close()
    except pymysql.err.IntegrityError:
        return jsonify({"success": False, "message": "分类名称已存在"}), 400

    return jsonify({
        "success": True,
        "data": {
            "id": subject_id,
            "name": name,
            "parent_id": None,
            "weight": 1.0,
            "difficulty": 1.0
        },
        "message": "分类已创建"
    }), 201