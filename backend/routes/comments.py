from flask import Blueprint, jsonify, request, session
from routes.auth import login_required
from db import get_db
from models import serialize_row

bp = Blueprint('comments', __name__, url_prefix='/api/comments')


@bp.route('/', methods=['GET'])
@login_required
def list_comments():
    question_id = request.args.get('question_id', type=int)
    if not question_id:
        return jsonify({"success": False, "message": "question_id is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.question_id, c.user_id, c.content, c.reply_to, c.created_at,
               u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.question_id = %s
        ORDER BY c.created_at ASC
    """, (question_id,))
    rows = cursor.fetchall()
    conn.close()

    items = []
    for row in rows:
        item = serialize_row(row)
        item['is_mine'] = item['user_id'] == session['user_id']
        items.append(item)

    return jsonify({"success": True, "data": {"items": items}, "message": ""}), 200


@bp.route('/', methods=['POST'])
@login_required
def create_comment():
    user_id = session['user_id']
    data = request.get_json() or {}
    question_id = data.get('question_id')
    content = (data.get('content') or '').strip()
    reply_to = data.get('reply_to')

    if not question_id or not content:
        return jsonify({"success": False, "message": "question_id and content are required"}), 400

    if len(content) > 500:
        return jsonify({"success": False, "message": "content must be at most 500 characters"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM questions WHERE id = %s", (question_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({"success": False, "message": "Question not found"}), 404

    if reply_to:
        cursor.execute("SELECT id FROM comments WHERE id = %s AND question_id = %s",
                       (reply_to, question_id))
        if cursor.fetchone() is None:
            conn.close()
            return jsonify({"success": False, "message": "Reply target not found"}), 404

    cursor.execute("""
        INSERT INTO comments (question_id, user_id, content, reply_to)
        VALUES (%s, %s, %s, %s)
    """, (question_id, user_id, content, reply_to))
    comment_id = cursor.lastrowid
    conn.commit()

    cursor.execute("""
        SELECT c.id, c.question_id, c.user_id, c.content, c.reply_to, c.created_at,
               u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = %s
    """, (comment_id,))
    row = cursor.fetchone()
    conn.close()

    item = serialize_row(row)
    item['is_mine'] = True

    return jsonify({
        "success": True,
        "data": item,
        "message": "Comment created"
    }), 201