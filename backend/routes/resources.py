from flask import Blueprint, jsonify, request
from routes.auth import login_required, admin_required
from db import get_db
from models import serialize_row

bp = Blueprint('resources', __name__, url_prefix='/api/resources')

RESOURCE_TYPES = ('大纲', '真题', '模拟题', '资料', '公告')


@bp.route('/', methods=['GET'])
@login_required
def list_resources():
    subject_id = request.args.get('subject_id', type=int)
    resource_type = request.args.get('type', '').strip()

    conn = get_db()
    cursor = conn.cursor()

    has_questions = request.args.get('has_questions', '').strip().lower()
    practice_only = request.args.get('practice_only', '').strip().lower()

    query = """
        SELECT r.id, r.title, r.type, r.content, r.url, r.created_at,
               r.subject_id, s.name as subject_name,
               (SELECT COUNT(*) FROM questions q WHERE q.resource_id = r.id) AS question_count
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

    if practice_only in ('1', 'true', 'yes'):
        query += " AND r.type IN ('真题', '模拟题', '资料')"
        query += " AND EXISTS (SELECT 1 FROM questions q WHERE q.resource_id = r.id)"

    if has_questions in ('1', 'true', 'yes'):
        query += " AND EXISTS (SELECT 1 FROM questions q WHERE q.resource_id = r.id)"

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
               r.subject_id, s.name as subject_name,
               (SELECT COUNT(*) FROM questions q WHERE q.resource_id = r.id) AS question_count
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


@bp.route('/', methods=['POST'])
@login_required
@admin_required
def create_resource():
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    resource_type = (data.get('type') or '').strip()
    content = (data.get('content') or '').strip() or None
    url = (data.get('url') or '').strip() or None
    subject_id = data.get('subject_id')

    if not title:
        return jsonify({"success": False, "message": "请填写资源标题"}), 400
    if resource_type not in RESOURCE_TYPES:
        return jsonify({"success": False, "message": "资源类型无效"}), 400

    if subject_id in (None, '', 'null'):
        subject_id = None
    else:
        try:
            subject_id = int(subject_id)
        except (TypeError, ValueError):
            return jsonify({"success": False, "message": "科目无效"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO resources (subject_id, title, type, content, url)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (subject_id, title, resource_type, content, url)
    )
    resource_id = cursor.lastrowid
    conn.commit()

    cursor.execute("""
        SELECT r.id, r.title, r.type, r.content, r.url, r.created_at,
               r.subject_id, s.name as subject_name,
               (SELECT COUNT(*) FROM questions q WHERE q.resource_id = r.id) AS question_count
        FROM resources r
        LEFT JOIN subjects s ON r.subject_id = s.id
        WHERE r.id = %s
    """, (resource_id,))
    row = cursor.fetchone()
    conn.close()

    return jsonify({
        "success": True,
        "data": serialize_row(row),
        "message": "资源已上传"
    }), 201


@bp.route('/<int:resource_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_resource(resource_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM resources WHERE id = %s", (resource_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({"success": False, "message": "资源不存在"}), 404

    cursor.execute("DELETE FROM resources WHERE id = %s", (resource_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "data": {"id": resource_id}, "message": "资源已删除"}), 200


@bp.route('/batch-delete', methods=['POST'])
@login_required
@admin_required
def batch_delete_resources():
    data = request.get_json() or {}
    ids = data.get('ids') or []

    if not isinstance(ids, list) or not ids:
        return jsonify({"success": False, "message": "请选择要删除的资源"}), 400

    try:
        id_list = [int(i) for i in ids]
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "资源 ID 无效"}), 400

    placeholders = ','.join(['%s'] * len(id_list))
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM resources WHERE id IN ({placeholders})", id_list)
    deleted = cursor.rowcount
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "data": {"deleted": deleted},
        "message": f"已删除 {deleted} 条资源"
    }), 200