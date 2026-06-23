from flask import Blueprint, jsonify, session
from routes.auth import login_required
from models import serialize_row

bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')


def get_db():
    from flask import current_app
    import sqlite3
    conn = sqlite3.connect(current_app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn


def fetch_weak_subjects(cursor, user_id, limit=3):
    cursor.execute("""
        SELECT wp.subject_id, s.name as subject_name, wp.accuracy, wp.total_answers
        FROM weak_points wp
        JOIN subjects s ON wp.subject_id = s.id
        WHERE wp.user_id = ?
        ORDER BY wp.accuracy ASC, wp.total_answers DESC
        LIMIT ?
    """, (user_id, limit))
    rows = list(cursor.fetchall())

    if rows:
        return rows

    cursor.execute("""
        SELECT q.subject_id, s.name as subject_name,
               ROUND(AVG(a.is_correct) * 100, 1) as accuracy,
               COUNT(*) as total_answers
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        JOIN subjects s ON q.subject_id = s.id
        WHERE a.user_id = ?
        GROUP BY q.subject_id, s.name
        ORDER BY accuracy ASC
        LIMIT ?
    """, (user_id, limit))
    return list(cursor.fetchall())


def match_score(accuracy, total_answers):
    base = max(50, min(98, int(100 - (accuracy or 50))))
    if total_answers and total_answers < 5:
        base = max(base, 75)
    return base


@bp.route('/', methods=['GET'])
@login_required
def list_recommendations():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    weak_subjects = fetch_weak_subjects(cursor, user_id)
    weak_list = [{
        'subject_id': row['subject_id'],
        'subject_name': row['subject_name'],
        'accuracy': round(float(row['accuracy']), 1),
        'total_answers': row['total_answers']
    } for row in weak_subjects]

    cursor.execute("""
        SELECT exam_type, start_date, exam_date, daily_minutes
        FROM goals WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1
    """, (user_id,))
    goal_row = cursor.fetchone()

    cursor.execute("""
        SELECT p.id,
               (SELECT COUNT(*) FROM plan_items pi WHERE pi.plan_id = p.id) as total,
               (SELECT SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END)
                FROM plan_items pi WHERE pi.plan_id = p.id) as completed
        FROM plans p
        WHERE p.user_id = ? AND p.status = 'active'
        ORDER BY p.created_at DESC LIMIT 1
    """, (user_id,))
    plan_row = cursor.fetchone()
    plan_progress = 0
    if plan_row and plan_row['total']:
        plan_progress = round((plan_row['completed'] or 0) / plan_row['total'] * 100, 1)

    cursor.execute("DELETE FROM recommendations WHERE user_id = ?", (user_id,))

    items = []
    seen = set()

    for weak in weak_list:
        subject_id = weak['subject_id']
        score = match_score(weak['accuracy'], weak['total_answers'])

        cursor.execute("""
            SELECT id, title, type, content
            FROM resources WHERE subject_id = ?
            ORDER BY CASE type WHEN '资料' THEN 1 WHEN '真题' THEN 2 ELSE 3 END
            LIMIT 1
        """, (subject_id,))
        resource = cursor.fetchone()
        if resource and ('resource', resource['id']) not in seen:
            reason = f"针对薄弱项「{weak['subject_name']}」（正确率 {weak['accuracy']}%），推荐相关学习资料。"
            cursor.execute("""
                INSERT INTO recommendations (user_id, type, target_id, reason)
                VALUES (?, 'resource', ?, ?)
            """, (user_id, resource['id'], reason))
            items.append({
                'type': 'resource',
                'target_id': resource['id'],
                'title': resource['title'],
                'subtitle': resource['type'],
                'reason': reason,
                'match_score': score,
                'subject_name': weak['subject_name'],
                'link': 'resources.html'
            })
            seen.add(('resource', resource['id']))

        cursor.execute("""
            SELECT id, content, type FROM questions
            WHERE subject_id = ? ORDER BY id LIMIT 1
        """, (subject_id,))
        question = cursor.fetchone()
        if question and ('question', question['id']) not in seen:
            preview = question['content'][:30] + ('…' if len(question['content']) > 30 else '')
            reason = f"针对薄弱项「{weak['subject_name']}」，推荐同类练习题巩固。"
            cursor.execute("""
                INSERT INTO recommendations (user_id, type, target_id, reason)
                VALUES (?, 'question', ?, ?)
            """, (user_id, question['id'], reason))
            items.append({
                'type': 'question',
                'target_id': question['id'],
                'title': preview,
                'subtitle': question['type'],
                'reason': reason,
                'match_score': max(score - 2, 70),
                'subject_name': weak['subject_name'],
                'link': 'qa.html'
            })
            seen.add(('question', question['id']))

    if not items:
        cursor.execute("""
            SELECT id, title, type, content, subject_id FROM resources
            ORDER BY id LIMIT 3
        """)
        for i, resource in enumerate(cursor.fetchall()):
            reason = '入门推荐：先从考试大纲和真题资料开始系统备考。'
            cursor.execute("""
                INSERT INTO recommendations (user_id, type, target_id, reason)
                VALUES (?, 'resource', ?, ?)
            """, (user_id, resource['id'], reason))
            items.append({
                'type': 'resource',
                'target_id': resource['id'],
                'title': resource['title'],
                'subtitle': resource['type'],
                'reason': reason,
                'match_score': 88 - i * 3,
                'subject_name': '通用',
                'link': 'resources.html'
            })

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "data": {
            "weak_subjects": weak_list,
            "goal": serialize_row(goal_row) if goal_row else None,
            "plan_progress": plan_progress,
            "items": items
        },
        "message": ""
    }), 200