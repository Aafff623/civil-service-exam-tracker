import json
from datetime import date
from flask import Blueprint, jsonify, request, session
from routes.auth import login_required
from db import get_db
from models import serialize_value

bp = Blueprint('answers', __name__, url_prefix='/api/answers')


@bp.route('/', methods=['POST'])
@login_required
def submit_answer():
    user_id = session['user_id']
    data = request.get_json() or {}
    question_id = data.get('question_id')
    selected_answer = data.get('selected_answer', '').strip()

    if not question_id or not selected_answer:
        return jsonify({"success": False, "message": "question_id and selected_answer are required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, subject_id, type, content, options, correct_answer, explanation, tips
        FROM questions WHERE id = %s
    """, (question_id,))
    question = cursor.fetchone()

    if question is None:
        conn.close()
        return jsonify({"success": False, "message": "Question not found"}), 404

    correct_answer = question['correct_answer'].strip()
    is_correct = 1 if selected_answer == correct_answer else 0

    cursor.execute("""
        INSERT INTO answers (user_id, question_id, selected_answer, is_correct)
        VALUES (%s, %s, %s, %s)
    """, (user_id, question_id, selected_answer, is_correct))
    conn.commit()

    subject_id = question['subject_id']
    cursor.execute("""
        SELECT id, accuracy, total_answers FROM weak_points
        WHERE user_id = %s AND subject_id = %s
    """, (user_id, subject_id))
    weak = cursor.fetchone()

    if weak is None:
        cursor.execute("""
            INSERT INTO weak_points (user_id, subject_id, accuracy, total_answers)
            VALUES (%s, %s, %s, %s)
        """, (user_id, subject_id, 100.0 if is_correct else 0.0, 1))
    else:
        total = weak['total_answers'] + 1
        correct_count = int(round(weak['accuracy'] / 100.0 * weak['total_answers'])) + is_correct
        new_accuracy = (correct_count / total) * 100.0
        cursor.execute("""
            UPDATE weak_points
            SET accuracy = %s, total_answers = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (new_accuracy, total, weak['id']))

    today = date.today().isoformat()
    cursor.execute("""
        SELECT id FROM progress WHERE user_id = %s AND record_date = %s
    """, (user_id, today))
    progress_row = cursor.fetchone()
    if progress_row is None:
        cursor.execute("""
            INSERT INTO progress (user_id, record_date, answer_count)
            VALUES (%s, %s, 1)
        """, (user_id, today))
    else:
        cursor.execute("""
            UPDATE progress SET answer_count = answer_count + 1 WHERE id = %s
        """, (progress_row['id'],))

    conn.commit()
    conn.close()

    try:
        options = json.loads(question['options'])
    except (json.JSONDecodeError, TypeError):
        options = []

    return jsonify({
        "success": True,
        "data": {
            "question_id": question_id,
            "selected_answer": selected_answer,
            "correct_answer": correct_answer,
            "is_correct": bool(is_correct),
            "explanation": question['explanation'],
            "tips": question['tips'],
            "subject_id": subject_id,
            "options": options
        },
        "message": "Answer submitted"
    }), 200


@bp.route('/history', methods=['GET'])
@login_required
def answer_history():
    user_id = session['user_id']
    subject_id = request.args.get('subject_id', type=int)

    conn = get_db()
    cursor = conn.cursor()

    query = """
        SELECT a.id, a.question_id, a.selected_answer, a.is_correct, a.created_at,
               q.content as question_content, q.correct_answer, q.subject_id,
               s.name as subject_name
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        LEFT JOIN subjects s ON q.subject_id = s.id
        WHERE a.user_id = %s
    """
    params = [user_id]

    if subject_id is not None:
        query += " AND q.subject_id = %s"
        params.append(subject_id)

    query += " ORDER BY a.created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for row in rows:
        items.append({
            "id": row['id'],
            "question_id": row['question_id'],
            "question_content": row['question_content'],
            "selected_answer": row['selected_answer'],
            "correct_answer": row['correct_answer'],
            "is_correct": bool(row['is_correct']),
            "subject_id": row['subject_id'],
            "subject_name": row['subject_name'],
            "created_at": serialize_value(row['created_at'])
        })

    return jsonify({"success": True, "data": {"items": items}, "message": ""}), 200