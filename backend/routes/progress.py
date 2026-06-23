from datetime import date, datetime, timedelta
from flask import Blueprint, jsonify, request, session
from routes.auth import login_required
from db import get_db
from models import as_date_str

bp = Blueprint('progress', __name__, url_prefix='/api/progress')

DEMO_SUBJECT_STATS = [
    {'subject_name': '言语理解与表达', 'completed': 18, 'total': 25, 'completion_rate': 72},
    {'subject_name': '数量关系', 'completed': 12, 'total': 20, 'completion_rate': 60},
    {'subject_name': '判断推理', 'completed': 14, 'total': 22, 'completion_rate': 64},
    {'subject_name': '资料分析', 'completed': 11, 'total': 20, 'completion_rate': 55},
    {'subject_name': '常识判断', 'completed': 15, 'total': 20, 'completion_rate': 75},
    {'subject_name': '申论', 'completed': 10, 'total': 15, 'completion_rate': 67},
]


def apply_demo_subject_stats(subject_stats, weak_rows, cursor):
    if subject_stats and any(item.get('completion_rate', 0) > 0 for item in subject_stats):
        return subject_stats

    weak_by_name = {row['subject_name']: row for row in weak_rows}
    cursor.execute("SELECT id, name FROM subjects ORDER BY id")
    subject_ids = {row['name']: row['id'] for row in cursor.fetchall()}

    demo = []
    for row in DEMO_SUBJECT_STATS:
        name = row['subject_name']
        weak = weak_by_name.get(name)
        demo.append({
            'subject_id': subject_ids.get(name),
            'subject_name': name,
            'completion_rate': row['completion_rate'],
            'completed': row['completed'],
            'total': row['total'],
            'accuracy': round(float(weak['accuracy']), 1) if weak else None,
            'is_demo': True,
        })
    return demo


def get_active_plan_id(cursor, user_id):
    cursor.execute("""
        SELECT id FROM plans
        WHERE user_id = %s AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
    """, (user_id,))
    row = cursor.fetchone()
    return row['id'] if row else None


def fetch_activity_dates(cursor, user_id):
    cursor.execute("""
        SELECT DISTINCT record_date as d FROM progress
        WHERE user_id = %s AND (completed_items > 0 OR answer_count > 0 OR study_minutes > 0)
    """, (user_id,))
    dates = {as_date_str(row['d']) for row in cursor.fetchall()}

    cursor.execute("""
        SELECT DISTINCT DATE(created_at) as d FROM answers WHERE user_id = %s
    """, (user_id,))
    dates.update(as_date_str(row['d']) for row in cursor.fetchall())
    return dates


def calc_streak(activity_dates, today=None):
    today = today or date.today()
    if not activity_dates:
        return 0, 0

    sorted_dates = sorted(
        datetime.strptime(d, '%Y-%m-%d').date()
        for d in activity_dates
    )

    max_streak = 0
    current = 0
    prev = None
    for d in sorted_dates:
        if prev and (d - prev).days == 1:
            current += 1
        else:
            current = 1
        max_streak = max(max_streak, current)
        prev = d

    streak = 0
    check = today if today.isoformat() in activity_dates else today - timedelta(days=1)
    while check.isoformat() in activity_dates:
        streak += 1
        check -= timedelta(days=1)

    return streak, max_streak


@bp.route('/', methods=['GET'])
@login_required
def get_progress_summary():
    user_id = session['user_id']
    days = request.args.get('days', 7, type=int)
    year = request.args.get('year', date.today().year, type=int)
    month = request.args.get('month', date.today().month, type=int)

    if days < 1 or days > 90:
        days = 7

    conn = get_db()
    cursor = conn.cursor()
    today = date.today()
    week_ago = today - timedelta(days=days - 1)
    prev_week_start = week_ago - timedelta(days=days)
    prev_week_end = week_ago - timedelta(days=1)

    cursor.execute("""
        SELECT COALESCE(SUM(study_minutes), 0) as total_minutes,
               COALESCE(SUM(completed_items), 0) as total_completed,
               COALESCE(SUM(answer_count), 0) as total_answers_progress
        FROM progress WHERE user_id = %s
    """, (user_id,))
    totals = cursor.fetchone()

    cursor.execute("""
        SELECT COALESCE(SUM(study_minutes), 0) as minutes
        FROM progress
        WHERE user_id = %s AND record_date BETWEEN %s AND %s
    """, (user_id, week_ago.isoformat(), today.isoformat()))
    this_week_minutes = cursor.fetchone()['minutes']

    cursor.execute("""
        SELECT COALESCE(SUM(study_minutes), 0) as minutes
        FROM progress
        WHERE user_id = %s AND record_date BETWEEN %s AND %s
    """, (user_id, prev_week_start.isoformat(), prev_week_end.isoformat()))
    prev_week_minutes = cursor.fetchone()['minutes']

    plan_id = get_active_plan_id(cursor, user_id)
    plan_total = 0
    plan_completed = 0
    if plan_id:
        cursor.execute("""
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
            FROM plan_items WHERE plan_id = %s
        """, (plan_id,))
        plan_stats = cursor.fetchone()
        plan_total = plan_stats['total'] or 0
        plan_completed = plan_stats['completed'] or 0

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM answers WHERE user_id = %s
    """, (user_id,))
    answer_stats = cursor.fetchone()
    total_answers = answer_stats['total'] or 0
    accuracy = round((answer_stats['correct'] or 0) / total_answers * 100, 1) if total_answers else 0

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM answers
        WHERE user_id = %s AND DATE(created_at) BETWEEN %s AND %s
    """, (user_id, week_ago.isoformat(), today.isoformat()))
    week_answers = cursor.fetchone()
    week_accuracy = 0
    if week_answers['total']:
        week_accuracy = round(week_answers['correct'] / week_answers['total'] * 100, 1)

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM answers
        WHERE user_id = %s AND DATE(created_at) BETWEEN %s AND %s
    """, (user_id, prev_week_start.isoformat(), prev_week_end.isoformat()))
    prev_answers = cursor.fetchone()
    prev_week_accuracy = 0
    if prev_answers['total']:
        prev_week_accuracy = round(prev_answers['correct'] / prev_answers['total'] * 100, 1)

    daily_study = []
    for i in range(days):
        d = week_ago + timedelta(days=i)
        cursor.execute("""
            SELECT COALESCE(SUM(study_minutes), 0) as minutes,
                   COALESCE(SUM(completed_items), 0) as completed_items,
                   COALESCE(SUM(answer_count), 0) as answer_count
            FROM progress WHERE user_id = %s AND record_date = %s
        """, (user_id, d.isoformat()))
        row = cursor.fetchone()
        daily_study.append({
            'date': d.isoformat(),
            'label': d.strftime('%m-%d'),
            'minutes': row['minutes'],
            'completed_items': row['completed_items'],
            'answer_count': row['answer_count']
        })

    subject_stats = []
    if plan_id:
        cursor.execute("""
            SELECT s.id, s.name,
                   COUNT(pi.id) as total,
                   SUM(CASE WHEN pi.is_completed = 1 THEN 1 ELSE 0 END) as completed
            FROM plan_items pi
            JOIN subjects s ON pi.subject_id = s.id
            WHERE pi.plan_id = %s
            GROUP BY s.id, s.name
            ORDER BY s.id
        """, (plan_id,))
        for row in cursor.fetchall():
            total = row['total'] or 0
            completed = row['completed'] or 0
            rate = round(completed / total * 100) if total else 0
            subject_stats.append({
                'subject_id': row['id'],
                'subject_name': row['name'],
                'completion_rate': rate,
                'completed': completed,
                'total': total
            })

    cursor.execute("""
        SELECT wp.subject_id, s.name as subject_name, wp.accuracy, wp.total_answers
        FROM weak_points wp
        JOIN subjects s ON wp.subject_id = s.id
        WHERE wp.user_id = %s
        ORDER BY wp.accuracy ASC
    """, (user_id,))
    weak_rows = cursor.fetchall()
    weak_map = {r['subject_id']: r for r in weak_rows}

    for item in subject_stats:
        weak = weak_map.get(item['subject_id'])
        item['accuracy'] = round(weak['accuracy'], 1) if weak else None

    subject_stats = apply_demo_subject_stats(subject_stats, weak_rows, cursor)

    if not subject_stats and weak_rows:
        for row in weak_rows:
            subject_stats.append({
                'subject_id': row['subject_id'],
                'subject_name': row['subject_name'],
                'completion_rate': 0,
                'completed': 0,
                'total': 0,
                'accuracy': round(row['accuracy'], 1)
            })

    cursor.execute("""
        SELECT DATE(created_at) as d,
               COUNT(*) as total,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM answers WHERE user_id = %s
        GROUP BY DATE(created_at)
        ORDER BY d DESC LIMIT %s
    """, (user_id, days))
    accuracy_trend = []
    for row in reversed(cursor.fetchall()):
        total = row['total'] or 0
        acc = round(row['correct'] / total * 100, 1) if total else 0
        d_str = as_date_str(row['d'])
        d = datetime.strptime(d_str, '%Y-%m-%d').date()
        accuracy_trend.append({
            'date': d_str,
            'label': d.strftime('%m-%d'),
            'accuracy': acc,
            'count': total
        })

    activity_dates = fetch_activity_dates(cursor, user_id)
    streak, max_streak = calc_streak(activity_dates, today)

    import calendar as cal
    _, month_days = cal.monthrange(year, month)
    checked_in_month = sorted(
        d for d in activity_dates
        if d.startswith(f'{year:04d}-{month:02d}-')
    )

    conn.close()

    total_hours = round(totals['total_minutes'] / 60, 1)
    hours_delta = round((this_week_minutes - prev_week_minutes) / 60, 1)
    plan_rate = round(plan_completed / plan_total * 100, 1) if plan_total else 0
    accuracy_delta = round(week_accuracy - prev_week_accuracy, 1) if prev_answers['total'] else 0

    return jsonify({
        "success": True,
        "data": {
            "overview": {
                "total_study_hours": total_hours,
                "study_hours_delta": hours_delta,
                "completed_tasks": totals['total_completed'],
                "plan_completion_rate": plan_rate,
                "plan_total_tasks": plan_total,
                "answer_accuracy": accuracy,
                "accuracy_delta": accuracy_delta,
                "total_answers": total_answers,
                "streak_days": streak,
                "max_streak_days": max_streak
            },
            "daily_study_minutes": daily_study,
            "subject_stats": subject_stats,
            "accuracy_trend": accuracy_trend,
            "calendar": {
                "year": year,
                "month": month,
                "days_in_month": month_days,
                "checked_dates": checked_in_month
            }
        },
        "message": ""
    }), 200