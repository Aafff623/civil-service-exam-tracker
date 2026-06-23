from datetime import date, datetime, timedelta
from flask import Blueprint, jsonify, request, session
from routes.auth import login_required

bp = Blueprint('progress', __name__, url_prefix='/api/progress')


def get_db():
    from flask import current_app
    import sqlite3
    conn = sqlite3.connect(current_app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn


def get_active_plan_id(cursor, user_id):
    cursor.execute("""
        SELECT id FROM plans
        WHERE user_id = ? AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
    """, (user_id,))
    row = cursor.fetchone()
    return row['id'] if row else None


def fetch_activity_dates(cursor, user_id):
    cursor.execute("""
        SELECT DISTINCT record_date as d FROM progress
        WHERE user_id = ? AND (completed_items > 0 OR answer_count > 0 OR study_minutes > 0)
    """, (user_id,))
    dates = {row['d'] for row in cursor.fetchall()}

    cursor.execute("""
        SELECT DISTINCT DATE(created_at) as d FROM answers WHERE user_id = ?
    """, (user_id,))
    dates.update(row['d'] for row in cursor.fetchall())
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

    if days < 1 or days > 30:
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
        FROM progress WHERE user_id = ?
    """, (user_id,))
    totals = cursor.fetchone()

    cursor.execute("""
        SELECT COALESCE(SUM(study_minutes), 0) as minutes
        FROM progress
        WHERE user_id = ? AND record_date BETWEEN ? AND ?
    """, (user_id, week_ago.isoformat(), today.isoformat()))
    this_week_minutes = cursor.fetchone()['minutes']

    cursor.execute("""
        SELECT COALESCE(SUM(study_minutes), 0) as minutes
        FROM progress
        WHERE user_id = ? AND record_date BETWEEN ? AND ?
    """, (user_id, prev_week_start.isoformat(), prev_week_end.isoformat()))
    prev_week_minutes = cursor.fetchone()['minutes']

    plan_id = get_active_plan_id(cursor, user_id)
    plan_total = 0
    plan_completed = 0
    if plan_id:
        cursor.execute("""
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
            FROM plan_items WHERE plan_id = ?
        """, (plan_id,))
        plan_stats = cursor.fetchone()
        plan_total = plan_stats['total'] or 0
        plan_completed = plan_stats['completed'] or 0

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM answers WHERE user_id = ?
    """, (user_id,))
    answer_stats = cursor.fetchone()
    total_answers = answer_stats['total'] or 0
    accuracy = round((answer_stats['correct'] or 0) / total_answers * 100, 1) if total_answers else 0

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM answers
        WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?
    """, (user_id, week_ago.isoformat(), today.isoformat()))
    week_answers = cursor.fetchone()
    week_accuracy = 0
    if week_answers['total']:
        week_accuracy = round(week_answers['correct'] / week_answers['total'] * 100, 1)

    cursor.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM answers
        WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?
    """, (user_id, prev_week_start.isoformat(), prev_week_end.isoformat()))
    prev_answers = cursor.fetchone()
    prev_week_accuracy = 0
    if prev_answers['total']:
        prev_week_accuracy = round(prev_answers['correct'] / prev_answers['total'] * 100, 1)

    daily_study = []
    for i in range(days):
        d = week_ago + timedelta(days=i)
        cursor.execute("""
            SELECT COALESCE(SUM(study_minutes), 0) as minutes
            FROM progress WHERE user_id = ? AND record_date = ?
        """, (user_id, d.isoformat()))
        row = cursor.fetchone()
        daily_study.append({
            'date': d.isoformat(),
            'label': d.strftime('%m-%d'),
            'minutes': row['minutes']
        })

    subject_stats = []
    if plan_id:
        cursor.execute("""
            SELECT s.id, s.name,
                   COUNT(pi.id) as total,
                   SUM(CASE WHEN pi.is_completed = 1 THEN 1 ELSE 0 END) as completed
            FROM plan_items pi
            JOIN subjects s ON pi.subject_id = s.id
            WHERE pi.plan_id = ?
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
        WHERE wp.user_id = ?
        ORDER BY wp.accuracy ASC
    """, (user_id,))
    weak_rows = cursor.fetchall()
    weak_map = {r['subject_id']: r for r in weak_rows}

    for item in subject_stats:
        weak = weak_map.get(item['subject_id'])
        item['accuracy'] = round(weak['accuracy'], 1) if weak else None

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
        FROM answers WHERE user_id = ?
        GROUP BY DATE(created_at)
        ORDER BY d DESC LIMIT ?
    """, (user_id, days))
    accuracy_trend = []
    for row in reversed(cursor.fetchall()):
        total = row['total'] or 0
        acc = round(row['correct'] / total * 100, 1) if total else 0
        d = datetime.strptime(row['d'], '%Y-%m-%d').date()
        accuracy_trend.append({
            'date': row['d'],
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