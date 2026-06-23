from flask import Blueprint, jsonify, request
from routes.auth import login_required

bp = Blueprint('resources', __name__, url_prefix='/api/resources')

def get_db():
    from flask import current_app
    import sqlite3
    conn = sqlite3.connect(current_app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

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
        query += " AND r.subject_id = ?"
        params.append(subject_id)

    if resource_type:
        query += " AND r.type = ?"
        params.append(resource_type)

    query += " ORDER BY r.created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for row in rows:
        items.append({
            "id": row['id'],
            "title": row['title'],
            "type": row['type'],
            "subject_id": row['subject_id'],
            "subject_name": row['subject_name'],
            "content": row['content'],
            "url": row['url'],
            "created_at": row['created_at']
        })

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
        WHERE r.id = ?
    """, (resource_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return jsonify({"success": False, "message": "Resource not found"}), 404

    return jsonify({
        "success": True,
        "data": {
            "id": row['id'],
            "title": row['title'],
            "type": row['type'],
            "subject_id": row['subject_id'],
            "subject_name": row['subject_name'],
            "content": row['content'],
            "url": row['url'],
            "created_at": row['created_at']
        },
        "message": ""
    }), 200
