from flask import Blueprint, jsonify, request
from routes.auth import login_required
from db import get_db
from models import serialize_row

bp = Blueprint('resources', __name__, url_prefix='/api/resources')


@bp.route('/', methods=['GET'])
@login_required
def list_resources():
    subject_id = request.args.get('subject_id', type=int)
    resource_type = request.args.get('type', '').strip()

    conn = get_db()
    cursor = conn.cursor()

    query = """
        SELECT r.id, r.title, r.type, r.content, r.url, r.created_at,
               r.subject_id, s.name as subject_name
        FROM resources r
        LEFT JOIN subjects s ON r.subject_id = s.id
        WHERE 1=1
    """
    params = []

    if subject_id is not None:
        query += " AND r.subject_id = %s"
        params.append(subject_id)

    if resource_type:
        query += " AND r.type = %s"
        params.append(resource_type)

    query += " ORDER BY r.created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    items = [serialize_row(row) for row in rows]

    return jsonify({"success": True, "data": {"items": items}, "message": ""}), 200


@bp.route('/<int:resource_id>', methods=['GET'])
@login_required
def get_resource(resource_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.title, r.type, r.content, r.url, r.created_at,
               r.subject_id, s.name as subject_name
        FROM resources r
        LEFT JOIN subjects s ON r.subject_id = s.id
        WHERE r.id = %s
    """, (resource_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return jsonify({"success": False, "message": "Resource not found"}), 404

    return jsonify({
        "success": True,
        "data": serialize_row(row),
        "message": ""
    }), 200