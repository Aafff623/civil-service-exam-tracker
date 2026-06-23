import json
from flask import Blueprint, jsonify, request
from routes.auth import login_required
from models import serialize_row

bp = Blueprint('questions', __name__, url_prefix='/api/questions')


def get_db():
    from flask import current_app
    import sqlite3
    conn = sqlite3.connect(current_app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn


@bp.route('/', methods=['GET'])
@login_required
def list_questions():
    subject_id = request.args.get('subject_id', type=int)
    question_type = request.args.get('type', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20

    conn = get_db()
    cursor = conn.cursor()

    query = """
        SELECT q.id, q.subject_id, q.type, q.content, q.options,
               q.correct_answer, q.explanation, q.tips, q.created_at,
               s.name as subject_name
        FROM questions q
        LEFT JOIN subjects s ON q.subject_id = s.id
        WHERE 1=1
    """
    count_query = """
        SELECT COUNT(*) as total
        FROM questions q
        WHERE 1=1
    """
    params = []
    count_params = []

    if subject_id is not None:
        query += " AND q.subject_id = ?"
        count_query += " AND q.subject_id = ?"
        params.append(subject_id)
        count_params.append(subject_id)

    if question_type:
        query += " AND q.type = ?"
        count_query += " AND q.type = ?"
        params.append(question_type)
        count_params.append(question_type)

    query += " ORDER BY q.id LIMIT ? OFFSET ?"
    params.append(per_page)
    params.append((page - 1) * per_page)

    cursor.execute(query, params)
    rows = cursor.fetchall()

    cursor.execute(count_query, count_params)
    total = cursor.fetchone()['total']
    conn.close()

    items = []
    for row in rows:
        item = serialize_row(row)
        try:
            item['options'] = json.loads(item['options'])
        except (json.JSONDecodeError, TypeError):
            item['options'] = []
        items.append(item)

    return jsonify({
        "success": True,
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page
        },
        "message": ""
    }), 200


@bp.route('/<int:question_id>', methods=['GET'])
@login_required
def get_question(question_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT q.id, q.subject_id, q.type, q.content, q.options,
               q.correct_answer, q.explanation, q.tips, q.created_at,
               s.name as subject_name
        FROM questions q
        LEFT JOIN subjects s ON q.subject_id = s.id
        WHERE q.id = ?
    """, (question_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return jsonify({"success": False, "message": "Question not found"}), 404

    item = serialize_row(row)
    try:
        item['options'] = json.loads(item['options'])
    except (json.JSONDecodeError, TypeError):
        item['options'] = []

    return jsonify({"success": True, "data": item, "message": ""}), 200
