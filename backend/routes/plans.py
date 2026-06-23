from datetime import date, datetime, timedelta
from flask import Blueprint, jsonify, request, session
from routes.auth import login_required
from db import get_db
from models import serialize_row, as_date_str

bp = Blueprint('plans', __name__, url_prefix='/api/plans')


def parse_date(value, field_name):
    if not value:
        return None, f'{field_name} is required'
    try:
        return datetime.strptime(str(value).strip()[:10], '%Y-%m-%d').date(), None
    except ValueError:
        return None, f'{field_name} must be YYYY-MM-DD'


def get_user_goal(cursor, user_id):
    cursor.execute("""
        SELECT id, user_id, exam_type, start_date, exam_date, daily_minutes,
               created_at, updated_at
        FROM goals WHERE user_id = %s
        ORDER BY updated_at DESC LIMIT 1
    """, (user_id,))
    return cursor.fetchone()


def get_active_plan(cursor, user_id):
    cursor.execute("""
        SELECT id, user_id, start_date, end_date, status, created_at
        FROM plans
        WHERE user_id = %s AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
    """, (user_id,))
    return cursor.fetchone()


def fetch_leaf_subjects(cursor):
    cursor.execute("""
        SELECT id, name, weight, difficulty
        FROM subjects s
        WHERE NOT EXISTS (
            SELECT 1 FROM subjects c WHERE c.parent_id = s.id
        )
        ORDER BY weight * difficulty DESC, id
    """)
    return cursor.fetchall()


def fetch_weak_points_map(cursor, user_id):
    cursor.execute("""
        SELECT subject_id, accuracy, total_answers
        FROM weak_points WHERE user_id = %s
    """, (user_id,))
    return {row['subject_id']: row for row in cursor.fetchall()}


def subject_priority(subject, weak_map):
    score = float(subject['weight']) * float(subject['difficulty'])
    weak = weak_map.get(subject['id'])
    if weak and weak['total_answers'] >= 5 and weak['accuracy'] < 60:
        score *= 1.5
    return score


def build_phases(total_days):
    if total_days <= 0:
        return []
    p1 = max(1, int(total_days * 0.3))
    p2 = max(1, int(total_days * 0.4))
    p3 = max(1, total_days - p1 - p2)
    return [
        {
            'name': '基础夯实阶段',
            'weeks': round(p1 / 7, 1),
            'description': f'第 1-{p1} 天：梳理知识点、建立错题本。'
        },
        {
            'name': '强化提升阶段',
            'weeks': round(p2 / 7, 1),
            'description': f'第 {p1 + 1}-{p1 + p2} 天：专项突破、提高做题速度。'
        },
        {
            'name': '冲刺模考阶段',
            'weeks': round(p3 / 7, 1),
            'description': f'第 {p1 + p2 + 1}-{total_days} 天：套卷训练、查漏补缺。'
        }
    ]


def generate_plan_items(start_date, end_date, daily_minutes, subjects, weak_map):
    total_days = (end_date - start_date).days + 1
    if total_days <= 0:
        return []

    ranked = sorted(
        subjects,
        key=lambda s: subject_priority(s, weak_map),
        reverse=True
    )
    if not ranked:
        return []

    items_per_day = max(2, min(5, daily_minutes // 30))
    minutes_per_item = max(15, daily_minutes // items_per_day)
    templates = [
        '专项练习与知识巩固',
        '错题回顾与归纳',
        '限时训练',
        '基础知识点梳理'
    ]

    items = []
    for day_offset in range(total_days):
        item_date = start_date + timedelta(days=day_offset)
        for slot in range(items_per_day):
            subject = ranked[(day_offset * items_per_day + slot) % len(ranked)]
            template = templates[slot % len(templates)]
            items.append({
                'subject_id': subject['id'],
                'item_date': item_date.isoformat(),
                'content': f"学习{subject['name']}：{template}",
                'suggested_minutes': minutes_per_item
            })
    return items


@bp.route('/goal', methods=['GET'])
@login_required
def get_goal():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    row = get_user_goal(cursor, user_id)
    conn.close()

    if row is None:
        return jsonify({"success": True, "data": None, "message": ""}), 200

    return jsonify({"success": True, "data": serialize_row(row), "message": ""}), 200


def validate_goal_payload(data):
    exam_type = (data.get('exam_type') or '国考').strip()
    daily_minutes = data.get('daily_minutes', 120)

    start_date, err = parse_date(data.get('start_date'), 'start_date')
    if err:
        return None, err

    exam_date, err = parse_date(data.get('exam_date'), 'exam_date')
    if err:
        return None, err

    if exam_date <= start_date:
        return None, 'exam_date must be after start_date'

    try:
        daily_minutes = int(daily_minutes)
    except (TypeError, ValueError):
        return None, 'daily_minutes must be an integer'

    if daily_minutes < 30 or daily_minutes > 720:
        return None, 'daily_minutes must be between 30 and 720'

    return {
        'exam_type': exam_type,
        'start_date': start_date,
        'exam_date': exam_date,
        'daily_minutes': daily_minutes
    }, None


def persist_goal(cursor, user_id, payload):
    existing = get_user_goal(cursor, user_id)
    if existing is None:
        cursor.execute("""
            INSERT INTO goals (user_id, exam_type, start_date, exam_date, daily_minutes)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            user_id,
            payload['exam_type'],
            payload['start_date'].isoformat(),
            payload['exam_date'].isoformat(),
            payload['daily_minutes']
        ))
    else:
        cursor.execute("""
            UPDATE goals
            SET exam_type = %s, start_date = %s, exam_date = %s, daily_minutes = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            payload['exam_type'],
            payload['start_date'].isoformat(),
            payload['exam_date'].isoformat(),
            payload['daily_minutes'],
            existing['id']
        ))


@bp.route('/goal', methods=['POST'])
@login_required
def save_goal():
    user_id = session['user_id']
    data = request.get_json() or {}

    payload, err = validate_goal_payload(data)
    if err:
        return jsonify({"success": False, "message": err}), 400

    conn = get_db()
    cursor = conn.cursor()
    persist_goal(cursor, user_id, payload)
    conn.commit()
    row = get_user_goal(cursor, user_id)
    conn.close()

    return jsonify({
        "success": True,
        "data": serialize_row(row),
        "message": "Goal saved"
    }), 200


@bp.route('/', methods=['GET'])
@login_required
def get_plan():
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    goal = get_user_goal(cursor, user_id)
    plan = get_active_plan(cursor, user_id)

    if plan is None:
        conn.close()
        return jsonify({
            "success": True,
            "data": {"goal": serialize_row(goal) if goal else None, "plan": None},
            "message": ""
        }), 200

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM plan_items WHERE plan_id = %s
    """, (plan['id'],))
    stats = cursor.fetchone()
    total_days = (datetime.strptime(as_date_str(plan['end_date']), '%Y-%m-%d').date()
                  - datetime.strptime(as_date_str(plan['start_date']), '%Y-%m-%d').date()).days + 1

    conn.close()

    return jsonify({
        "success": True,
        "data": {
            "goal": serialize_row(goal) if goal else None,
            "plan": {
                **serialize_row(plan),
                "total_items": stats['total'],
                "completed_items": stats['completed'] or 0,
                "total_days": total_days,
                "total_weeks": round(total_days / 7, 1),
                "phases": build_phases(total_days)
            }
        },
        "message": ""
    }), 200


@bp.route('/generate', methods=['POST'])
@login_required
def generate_plan():
    user_id = session['user_id']
    data = request.get_json() or {}

    conn = get_db()
    cursor = conn.cursor()

    if data.get('start_date') or data.get('exam_date') or data.get('daily_minutes'):
        payload, err = validate_goal_payload(data)
        if err:
            conn.close()
            return jsonify({"success": False, "message": err}), 400
        persist_goal(cursor, user_id, payload)
        conn.commit()

    goal = get_user_goal(cursor, user_id)
    if goal is None:
        conn.close()
        return jsonify({"success": False, "message": "Please set a learning goal first"}), 400

    start_date = datetime.strptime(as_date_str(goal['start_date']), '%Y-%m-%d').date()
    exam_date = datetime.strptime(as_date_str(goal['exam_date']), '%Y-%m-%d').date()
    daily_minutes = goal['daily_minutes']

    subjects = fetch_leaf_subjects(cursor)
    if not subjects:
        conn.close()
        return jsonify({"success": False, "message": "No subjects available"}), 500

    weak_map = fetch_weak_points_map(cursor, user_id)
    plan_items = generate_plan_items(start_date, exam_date, daily_minutes, subjects, weak_map)

    old_plan = get_active_plan(cursor, user_id)
    if old_plan:
        cursor.execute("DELETE FROM plan_items WHERE plan_id = %s", (old_plan['id'],))
        cursor.execute("DELETE FROM plans WHERE id = %s", (old_plan['id'],))

    cursor.execute("""
        INSERT INTO plans (user_id, start_date, end_date, status)
        VALUES (%s, %s, %s, 'active')
    """, (user_id, start_date.isoformat(), exam_date.isoformat()))
    plan_id = cursor.lastrowid

    for item in plan_items:
        cursor.execute("""
            INSERT INTO plan_items (plan_id, subject_id, item_date, content, suggested_minutes)
            VALUES (%s, %s, %s, %s, %s)
        """, (plan_id, item['subject_id'], item['item_date'], item['content'], item['suggested_minutes']))

    conn.commit()

    cursor.execute("SELECT COUNT(*) as total FROM plan_items WHERE plan_id = %s", (plan_id,))
    total = cursor.fetchone()['total']
    total_days = (exam_date - start_date).days + 1

    conn.close()

    return jsonify({
        "success": True,
        "data": {
            "plan_id": plan_id,
            "total_items": total,
            "total_days": total_days,
            "total_weeks": round(total_days / 7, 1),
            "phases": build_phases(total_days)
        },
        "message": "Plan generated"
    }), 201


@bp.route('/items', methods=['GET'])
@login_required
def list_plan_items():
    user_id = session['user_id']
    item_date = request.args.get('date', '').strip()
    date_from = request.args.get('from', '').strip()
    date_to = request.args.get('to', '').strip()

    conn = get_db()
    cursor = conn.cursor()
    plan = get_active_plan(cursor, user_id)

    if plan is None:
        conn.close()
        return jsonify({"success": True, "data": {"items": []}, "message": ""}), 200

    query = """
        SELECT pi.id, pi.plan_id, pi.subject_id, pi.item_date, pi.content,
               pi.suggested_minutes, pi.is_completed, pi.created_at,
               s.name as subject_name
        FROM plan_items pi
        JOIN subjects s ON pi.subject_id = s.id
        WHERE pi.plan_id = %s
    """
    params = [plan['id']]

    if item_date:
        query += " AND pi.item_date = %s"
        params.append(item_date)
    elif date_from and date_to:
        query += " AND pi.item_date BETWEEN %s AND %s"
        params.extend([date_from, date_to])
    elif date_from:
        query += " AND pi.item_date >= %s"
        params.append(date_from)

    query += " ORDER BY pi.item_date, pi.id"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for row in rows:
        item = serialize_row(row)
        item['is_completed'] = bool(item['is_completed'])
        items.append(item)

    return jsonify({"success": True, "data": {"items": items}, "message": ""}), 200


@bp.route('/items/<int:item_id>', methods=['PATCH'])
@login_required
def update_plan_item(item_id):
    user_id = session['user_id']
    data = request.get_json() or {}

    if 'is_completed' not in data:
        return jsonify({"success": False, "message": "is_completed is required"}), 400

    is_completed = 1 if data['is_completed'] else 0

    conn = get_db()
    cursor = conn.cursor()
    plan = get_active_plan(cursor, user_id)

    if plan is None:
        conn.close()
        return jsonify({"success": False, "message": "No active plan"}), 404

    cursor.execute("""
        SELECT id FROM plan_items
        WHERE id = %s AND plan_id = %s
    """, (item_id, plan['id']))
    item = cursor.fetchone()

    if item is None:
        conn.close()
        return jsonify({"success": False, "message": "Plan item not found"}), 404

    cursor.execute("""
        UPDATE plan_items SET is_completed = %s WHERE id = %s
    """, (is_completed, item_id))

    item_date = None
    cursor.execute("SELECT item_date FROM plan_items WHERE id = %s", (item_id,))
    row = cursor.fetchone()
    if row:
        item_date = as_date_str(row['item_date'])

    if is_completed and item_date:
        cursor.execute("""
            SELECT id, study_minutes, completed_items
            FROM progress
            WHERE user_id = %s AND record_date = %s
        """, (user_id, item_date))
        progress = cursor.fetchone()
        cursor.execute("""
            SELECT suggested_minutes FROM plan_items WHERE id = %s
        """, (item_id,))
        minutes_row = cursor.fetchone()
        add_minutes = minutes_row['suggested_minutes'] if minutes_row else 0

        if progress is None:
            cursor.execute("""
                INSERT INTO progress (user_id, record_date, study_minutes, completed_items)
                VALUES (%s, %s, %s, 1)
            """, (user_id, item_date, add_minutes))
        else:
            cursor.execute("""
                UPDATE progress
                SET study_minutes = study_minutes + %s,
                    completed_items = completed_items + 1
                WHERE id = %s
            """, (add_minutes, progress['id']))
    elif not is_completed and item_date:
        cursor.execute("""
            SELECT id, study_minutes, completed_items
            FROM progress
            WHERE user_id = %s AND record_date = %s
        """, (user_id, item_date))
        progress = cursor.fetchone()
        if progress and progress['completed_items'] > 0:
            cursor.execute("""
                SELECT suggested_minutes FROM plan_items WHERE id = %s
            """, (item_id,))
            minutes_row = cursor.fetchone()
            sub_minutes = minutes_row['suggested_minutes'] if minutes_row else 0
            new_minutes = max(0, progress['study_minutes'] - sub_minutes)
            new_completed = max(0, progress['completed_items'] - 1)
            cursor.execute("""
                UPDATE progress
                SET study_minutes = %s, completed_items = %s
                WHERE id = %s
            """, (new_minutes, new_completed, progress['id']))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "data": {"id": item_id, "is_completed": bool(is_completed)},
        "message": "Plan item updated"
    }), 200


@bp.route('/subjects', methods=['GET'])
@login_required
def list_plan_subjects():
    conn = get_db()
    cursor = conn.cursor()
    rows = fetch_leaf_subjects(cursor)
    conn.close()

    def stars(weight):
        count = max(1, min(5, round(float(weight) * 4)))
        return '★' * count + '☆' * (5 - count)

    def difficulty_label(value):
        if value >= 1.2:
            return '较难'
        if value >= 1.0:
            return '中等'
        return '较易'

    items = [{
        "id": row['id'],
        "name": row['name'],
        "weight": float(row['weight']),
        "difficulty": float(row['difficulty']),
        "importance_stars": stars(row['weight']),
        "difficulty_label": difficulty_label(float(row['difficulty']))
    } for row in rows]

    return jsonify({"success": True, "data": {"items": items}, "message": ""}), 200