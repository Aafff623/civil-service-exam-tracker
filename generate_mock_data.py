import json
import re
from datetime import date, datetime, timedelta
from pathlib import Path

SQL_PATH = Path('db/seed/init_db.sql')
OUT_PATH = Path('frontend/js/mock-data.js')

TODAY = date.today()
NOW = datetime.now()


def parse_sql_value(raw):
    raw = raw.strip()
    upper = raw.upper()

    if raw == 'NULL':
        return None

    # Boolean-ish numeric from CHECK
    if raw in ('0', '1') and not raw.startswith('"'):
        return int(raw)

    if re.match(r'^-?\d+(\.\d+)?$', raw):
        return int(raw) if '.' not in raw else float(raw)

    # DATE_SUB(NOW(), INTERVAL n DAY) / DATE_SUB(CURDATE(), INTERVAL n DAY)
    m = re.match(r"DATE_SUB\((NOW\(\)|CURDATE\(\)),\s*INTERVAL\s+(-?\d+)\s+DAY\)", raw, re.I)
    if m:
        n = int(m.group(2))
        if m.group(1).upper() == 'NOW()':
            return (NOW - timedelta(days=n)).strftime('%Y-%m-%d %H:%M:%S')
        return (TODAY - timedelta(days=n)).isoformat()

    # DATE_ADD(CURDATE(), INTERVAL n DAY)
    m = re.match(r"DATE_ADD\((CURDATE\(\)),\s*INTERVAL\s+(-?\d+)\s+DAY\)", raw, re.I)
    if m:
        n = int(m.group(2))
        return (TODAY + timedelta(days=n)).isoformat()

    # CURDATE() / NOW()
    if upper == 'CURDATE()':
        return TODAY.isoformat()
    if upper == 'NOW()':
        return NOW.strftime('%Y-%m-%d %H:%M:%S')

    # String literal
    if raw.startswith("'") and raw.endswith("'"):
        inner = raw[1:-1]
        inner = inner.replace("''", "'").replace("\\'", "'")
        # Try parse JSON array (options)
        if inner.startswith('[') and inner.endswith(']'):
            try:
                return json.loads(inner)
            except json.JSONDecodeError:
                pass
        return inner

    return raw


def split_values(values_str):
    """Split top-level comma-separated SQL values."""
    parts = []
    depth = 0
    buf = ''
    in_str = False
    i = 0
    while i < len(values_str):
        ch = values_str[i]
        if ch == "'" and (i == 0 or values_str[i-1] != '\\'):
            in_str = not in_str
        if not in_str:
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
            elif ch == ',' and depth == 0:
                parts.append(buf.strip())
                buf = ''
                i += 1
                continue
        buf += ch
        i += 1
    if buf.strip():
        parts.append(buf.strip())
    return parts


def parse_insert(sql):
    """Parse INSERT INTO table (cols) VALUES (...), (...);"""
    pattern = re.compile(
        r"INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s+(.+?);\s*$",
        re.DOTALL | re.IGNORECASE | re.MULTILINE
    )
    rows_by_table = {}
    for m in pattern.finditer(sql):
        table = m.group(1)
        cols = [c.strip() for c in m.group(2).split(',')]
        values_block = m.group(3)
        # split into individual row value tuples
        row_strs = []
        depth = 0
        buf = ''
        in_str = False
        for ch in values_block:
            if ch == "'":
                in_str = not in_str
            if not in_str:
                if ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                elif ch == ',' and depth == 0:
                    if buf.strip():
                        row_strs.append(buf.strip())
                    buf = ''
                    continue
            buf += ch
        if buf.strip():
            row_strs.append(buf.strip())

        rows = []
        for row_str in row_strs:
            if not (row_str.startswith('(') and row_str.endswith(')')):
                continue
            vals = split_values(row_str[1:-1])
            row = {}
            for col, val in zip(cols, vals):
                row[col] = parse_sql_value(val)
            rows.append(row)
        # Auto-increment id if the column wasn't included (MySQL AUTO_INCREMENT)
        if 'id' not in cols:
            next_id = 1
            for row in rows:
                row['id'] = next_id
                next_id += 1

        rows_by_table.setdefault(table, []).extend(rows)
    return rows_by_table


def generate_plan_items():
    """Reproduce the INSERT INTO ... SELECT logic for root user's plan."""
    items = []
    subjects_def = [
        (2, '言语理解与表达', '专项练习与知识巩固', 45),
        (3, '数量关系', '限时训练', 45),
        (4, '判断推理', '错题回顾与归纳', 40),
        (5, '资料分析', '速算技巧演练', 40),
        (6, '常识判断', '时政热点梳理', 30),
        (7, '申论', '大作文提纲练习', 50),
    ]
    item_id = 1
    for offs in range(-13, 8):
        item_date = (TODAY + timedelta(days=offs)).isoformat()
        for sid, sname, task_type, minutes in subjects_def:
            is_completed = 1 if item_date < TODAY.isoformat() or (item_date == TODAY.isoformat() and sid in (3, 5)) else 0
            items.append({
                'id': item_id,
                'plan_id': 1,
                'subject_id': sid,
                'item_date': item_date,
                'content': f'学习{sname}：{task_type}',
                'suggested_minutes': minutes,
                'is_completed': is_completed,
                'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')
            })
            item_id += 1
    # User 2 sample items
    items.extend([
        {'id': item_id, 'plan_id': 2, 'subject_id': 2, 'item_date': TODAY.isoformat(), 'content': '学习言语理解与表达：基础巩固', 'suggested_minutes': 30, 'is_completed': 0, 'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')},
        {'id': item_id + 1, 'plan_id': 2, 'subject_id': 3, 'item_date': TODAY.isoformat(), 'content': '学习数量关系：公式记忆', 'suggested_minutes': 30, 'is_completed': 0, 'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')},
        {'id': item_id + 2, 'plan_id': 2, 'subject_id': 4, 'item_date': (TODAY - timedelta(days=1)).isoformat(), 'content': '学习判断推理：图形推理', 'suggested_minutes': 30, 'is_completed': 1, 'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')},
    ])
    return items


def generate_progress():
    """Reproduce the INSERT INTO ... SELECT logic for root user's progress."""
    records = []
    for n in range(13, 0, -1):
        record_date = (TODAY - timedelta(days=n)).isoformat()
        records.append({
            'id': len(records) + 1,
            'user_id': 1,
            'record_date': record_date,
            'study_minutes': 75 + (n * 11) % 80,
            'completed_items': 3 + (n % 3),
            'answer_count': 1 + (n % 2),
            'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')
        })
    records.append({
        'id': len(records) + 1,
        'user_id': 1,
        'record_date': TODAY.isoformat(),
        'study_minutes': 90,
        'completed_items': 2,
        'answer_count': 2,
        'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')
    })
    records.append({
        'id': len(records) + 1,
        'user_id': 2,
        'record_date': (TODAY - timedelta(days=1)).isoformat(),
        'study_minutes': 60,
        'completed_items': 1,
        'answer_count': 2,
        'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')
    })
    return records


def main():
    sql = SQL_PATH.read_text(encoding='utf-8')
    data = parse_insert(sql)

    subjects = data.get('subjects', [])
    users = data.get('users', [])
    resources = data.get('resources', [])
    questions = data.get('questions', [])
    answers = data.get('answers', [])
    goals = data.get('goals', [])
    plans = data.get('plans', [])
    plan_items = generate_plan_items()
    progress = generate_progress()
    weak_points = data.get('weak_points', [])
    comments = data.get('comments', [])

    # Enrich users: add created_at and strip password_hash from mock output
    for u in users:
        u.setdefault('created_at', '2026-01-15 10:00:00')
        u.pop('password_hash', None)

    subject_map = {s['id']: s for s in subjects}
    user_map = {u['id']: u for u in users}
    resource_map = {r['id']: r for r in resources}
    question_map = {q['id']: q for q in questions}

    # Enrich resources
    q_count_by_resource = {}
    for q in questions:
        rid = q.get('resource_id')
        if rid:
            q_count_by_resource[rid] = q_count_by_resource.get(rid, 0) + 1

    for r in resources:
        sid = r.get('subject_id')
        r['subject_name'] = subject_map.get(sid, {}).get('name') if sid else '通用'
        r['question_count'] = q_count_by_resource.get(r['id'], 0)
        r.setdefault('created_at', '2026-01-15 10:00:00')

    # Enrich questions
    for q in questions:
        q['subject_name'] = subject_map.get(q.get('subject_id'), {}).get('name', '通用')
        rid = q.get('resource_id')
        q['resource_title'] = resource_map.get(rid, {}).get('title', '') if rid else ''
        q['resource_type'] = resource_map.get(rid, {}).get('type', '') if rid else ''
        if 'options' in q and isinstance(q['options'], list):
            # keep as is
            pass
        elif 'options' in q and isinstance(q['options'], str):
            try:
                q['options'] = json.loads(q['options'])
            except Exception:
                q['options'] = []
        q.setdefault('created_at', '2026-01-15 10:00:00')

    # Enrich answers for history
    answer_history = []
    for a in answers:
        q = question_map.get(a.get('question_id'))
        if q:
            a['content'] = q.get('content', '')
            a['subject_name'] = q.get('subject_name', '')
            a['correct_answer'] = q.get('correct_answer', '')
        answer_history.append(a)

    # Build weak subjects for recommendations
    weak_subjects = [
        {
            'subject_id': wp['subject_id'],
            'subject_name': subject_map.get(wp['subject_id'], {}).get('name', ''),
            'accuracy': wp['accuracy'],
            'total_answers': wp['total_answers']
        }
        for wp in weak_points if wp.get('user_id') == 1
    ]

    # Goal for root user
    root_goal = goals[0] if goals else {
        'id': 1,
        'user_id': 1,
        'exam_type': '国考',
        'start_date': (TODAY - timedelta(days=30)).isoformat(),
        'exam_date': (TODAY + timedelta(days=180)).isoformat(),
        'daily_minutes': 180
    }

    # Plan for root user
    root_plan = plans[0] if plans else {
        'id': 1,
        'user_id': 1,
        'start_date': root_goal['start_date'],
        'end_date': root_goal['exam_date'],
        'status': 'active',
        'created_at': NOW.strftime('%Y-%m-%d %H:%M:%S')
    }

    completed_items = sum(1 for p in plan_items if p.get('plan_id') == root_plan['id'] and p.get('is_completed'))
    total_items = sum(1 for p in plan_items if p.get('plan_id') == root_plan['id'])
    total_days = (TODAY + timedelta(days=180) - (TODAY - timedelta(days=30))).days
    total_weeks = max(1, round(total_days / 7))

    root_plan_enriched = {
        **root_plan,
        'total_items': total_items,
        'completed_items': completed_items,
        'total_days': total_days,
        'total_weeks': total_weeks,
        'phases': [
            {'name': '基础阶段', 'weeks': 8, 'description': '系统学习各科目核心知识点，建立知识框架，每日完成基础练习。'},
            {'name': '强化阶段', 'weeks': 12, 'description': '分模块限时训练，重点突破薄弱项，整理错题本。'},
            {'name': '冲刺阶段', 'weeks': 6, 'description': '全真模拟考试，复盘错题，调整答题顺序与时间分配。'}
        ]
    }

    # Plan subjects (leaf subjects with metadata)
    plan_subjects = []
    importance_map = {1: '★★★★', 2: '★★★', 3: '★★★★', 4: '★★★★', 5: '★★★★', 6: '★★', 7: '★★★★★'}
    difficulty_map = {1: '中等', 2: '较易', 3: '较难', 4: '中等', 5: '中等', 6: '较易', 7: '较难'}
    for s in subjects:
        if s.get('parent_id') == 1 or s.get('id') == 7:
            plan_subjects.append({
                'id': s['id'],
                'name': s['name'],
                'weight': s['weight'],
                'difficulty': s['difficulty'],
                'importance_stars': importance_map.get(s['id'], '★★★'),
                'difficulty_label': difficulty_map.get(s['id'], '中等')
            })

    # Enrich plan items
    for p in plan_items:
        sid = p.get('subject_id')
        p['subject_name'] = subject_map.get(sid, {}).get('name', '')
        p.setdefault('created_at', NOW.strftime('%Y-%m-%d %H:%M:%S'))

    # Progress overview
    root_progress = [p for p in progress if p.get('user_id') == 1]
    daily_minutes = []
    checked_dates = []
    for p in root_progress:
        daily_minutes.append({
            'date': p['record_date'],
            'label': p['record_date'][5:].replace('-', '/'),
            'minutes': p['study_minutes'],
            'completed_items': p['completed_items'],
            'answer_count': p['answer_count']
        })
        if p.get('study_minutes', 0) > 0 or p.get('completed_items', 0) > 0:
            checked_dates.append(p['record_date'])

    total_minutes = sum(p['study_minutes'] for p in root_progress)
    total_hours = round(total_minutes / 60, 1)
    completed_tasks = sum(p['completed_items'] for p in root_progress)
    total_answers = sum(p['answer_count'] for p in root_progress)

    # Answer accuracy from root answers
    root_answers = [a for a in answers if a.get('user_id') == 1]
    correct = sum(1 for a in root_answers if a.get('is_correct'))
    accuracy = round(correct / len(root_answers) * 100, 1) if root_answers else 0

    # Streak (simplified: consecutive days from today backward with study)
    dates_with_study = sorted({p['record_date'] for p in root_progress if p.get('study_minutes', 0) > 0}, reverse=True)
    streak = 0
    for i, d in enumerate(dates_with_study):
        expected = (TODAY - timedelta(days=i)).isoformat()
        if d == expected:
            streak += 1
        else:
            break

    # Subject stats
    subject_stats = []
    for s in plan_subjects:
        items = [p for p in plan_items if p.get('subject_id') == s['id'] and p.get('plan_id') == root_plan['id']]
        completed = sum(1 for p in items if p.get('is_completed'))
        total = len(items)
        wp = next((w for w in weak_points if w['user_id'] == 1 and w['subject_id'] == s['id']), None)
        subject_stats.append({
            'subject_id': s['id'],
            'subject_name': s['name'],
            'completion_rate': round(completed / total * 100, 1) if total else 0,
            'completed': completed,
            'total': total,
            'accuracy': wp['accuracy'] if wp else 0,
            'is_demo': False
        })

    # Accuracy trend (weekly)
    accuracy_trend = [
        {'date': (TODAY - timedelta(days=21)).isoformat(), 'label': '3周前', 'accuracy': 55, 'count': 4},
        {'date': (TODAY - timedelta(days=14)).isoformat(), 'label': '2周前', 'accuracy': 62, 'count': 6},
        {'date': (TODAY - timedelta(days=7)).isoformat(), 'label': '上周', 'accuracy': 68, 'count': 8},
        {'date': TODAY.isoformat(), 'label': '本周', 'accuracy': accuracy, 'count': len(root_answers[-8:]) or 1},
    ]

    # Recommendations
    recommendation_items = [
        {
            'type': 'question',
            'target_id': 5,
            'title': '专项练习：资料分析增长率',
            'subtitle': '5 道经典题',
            'reason': '你在资料分析模块正确率偏低，建议集中突破增长率与比重计算。',
            'match_score': 92,
            'subject_id': 5,
            'subject_name': '资料分析',
            'link': 'qa.html?subject_id=5'
        },
        {
            'type': 'resource',
            'target_id': 11,
            'title': '资料分析速算技巧',
            'subtitle': '截位直除与比较估算',
            'reason': '系统学习速算方法可显著提升资料分析解题速度。',
            'match_score': 88,
            'subject_id': 5,
            'subject_name': '资料分析',
            'link': 'resource-detail.html?id=11'
        },
        {
            'type': 'question',
            'target_id': 8,
            'title': '数量关系工程问题专项',
            'subtitle': '8 道必考题型',
            'reason': '数量关系是你的薄弱项，工程问题性价比高，优先掌握。',
            'match_score': 85,
            'subject_id': 3,
            'subject_name': '数量关系',
            'link': 'qa.html?subject_id=3'
        },
        {
            'type': 'resource',
            'target_id': 8,
            'title': '数量关系公式手册',
            'subtitle': '行程、工程、利润分章公式',
            'reason': '先建立公式体系，再配合刷题巩固，正确率可快速提升。',
            'match_score': 82,
            'subject_id': 3,
            'subject_name': '数量关系',
            'link': 'resource-detail.html?id=8'
        },
        {
            'type': 'question',
            'target_id': 2,
            'title': '言语理解逻辑填空练习',
            'subtitle': '10 道高频成语题',
            'reason': '言语理解基础较好，保持手感即可，重点辨析易混成语。',
            'match_score': 75,
            'subject_id': 2,
            'subject_name': '言语理解与表达',
            'link': 'qa.html?subject_id=2'
        }
    ]

    # Comments enriched
    enriched_comments = []
    for c in comments:
        enriched_comments.append({
            'id': c['id'],
            'question_id': c['question_id'],
            'user_id': c['user_id'],
            'content': c['content'],
            'reply_to': c.get('reply_to'),
            'created_at': c['created_at'],
            'username': user_map.get(c['user_id'], {}).get('username', 'root'),
            'is_mine': c['user_id'] == 1
        })

    # Root user for auth
    root_user = user_map.get(1, {'id': 1, 'username': 'root', 'role': 'admin', 'created_at': '2026-01-15 10:00:00'})

    mock_data = {
        '/auth/me': {'success': True, 'data': root_user},
        '/auth/login': {'success': True, 'data': root_user},
        '/auth/register': {'success': True, 'data': {'id': 5, 'username': 'newuser', 'role': 'user'}},
        '/auth/logout': {'success': True, 'data': {}},
        '/subjects/': {'success': True, 'data': {'items': subjects}},
        '/resources/': {'success': True, 'data': {'items': resources}},
        '/questions/': {'success': True, 'data': {'items': questions[:50], 'total': len(questions), 'page': 1, 'per_page': 50}},
        '/questions/all': {'success': True, 'data': {'items': questions, 'total': len(questions), 'page': 1, 'per_page': len(questions)}},
        '/answers/': {'success': True, 'data': None},
        '/answers/history': {'success': True, 'data': {'items': answer_history[:8]}},
        '/plans/goal': {'success': True, 'data': root_goal},
        '/plans/': {'success': True, 'data': {'goal': root_goal, 'plan': root_plan_enriched}},
        '/plans/generate': {'success': True, 'data': {
            'plan_id': root_plan['id'],
            'total_items': total_items,
            'total_days': total_days,
            'total_weeks': total_weeks,
            'phases': root_plan_enriched['phases']
        }},
        '/plans/items': {'success': True, 'data': {'items': [p for p in plan_items if p.get('plan_id') == root_plan['id']]}},
        '/plans/subjects': {'success': True, 'data': {'items': plan_subjects}},
        '/progress/': {'success': True, 'data': {
            'overview': {
                'total_study_hours': total_hours,
                'study_hours_delta': 1.5,
                'completed_tasks': completed_tasks,
                'plan_completion_rate': round(completed_items / total_items * 100, 1) if total_items else 0,
                'plan_total_tasks': total_items,
                'answer_accuracy': accuracy,
                'accuracy_delta': 3,
                'total_answers': total_answers,
                'streak_days': streak,
                'max_streak_days': max(streak, 7)
            },
            'daily_study_minutes': daily_minutes,
            'subject_stats': subject_stats,
            'accuracy_trend': accuracy_trend,
            'calendar': {'year': TODAY.year, 'month': TODAY.month, 'days_in_month': 30, 'checked_dates': checked_dates}
        }},
        '/recommendations/': {'success': True, 'data': {
            'weak_subjects': weak_subjects,
            'goal': root_goal,
            'plan_progress': round(completed_items / total_items * 100, 1) if total_items else 0,
            'items': recommendation_items
        }},
        '/comments/': {'success': True, 'data': {'items': enriched_comments}}
    }

    # Per-resource endpoints
    for r in resources:
        mock_data[f'/resources/{r["id"]}'] = {'success': True, 'data': r}

    # Per-question endpoints
    for q in questions:
        mock_data[f'/questions/{q["id"]}'] = {'success': True, 'data': q}

    js = f"""// Auto-generated from db/seed/init_db.sql on {TODAY.isoformat()}
// Do not edit manually; rerun generate_mock_data.py to refresh.
const MOCK_DATA = {json.dumps(mock_data, ensure_ascii=False, indent=2)};
"""

    OUT_PATH.write_text(js, encoding='utf-8')
    print(f'Wrote {OUT_PATH} with {len(mock_data)} endpoints')


if __name__ == '__main__':
    main()
