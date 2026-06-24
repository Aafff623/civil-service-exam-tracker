# Week 2 可直接引用的文档原文与代码片段

## 一、业务规则原文

### 弱项识别规则（CONTEXT.md）
> "弱项识别只在答题样本量 ≥ 5 题时生效。"
> — `CONTEXT.md:121`

> "推荐内容优先针对正确率最低的科目。"
> — `CONTEXT.md:122`

> "一个用户同时只有一个有效的学习计划；重新生成会覆盖旧计划。"
> — `CONTEXT.md:120`

## 二、核心算法代码

### 1. 多选答案规范化（backend/routes/answers.py:11-13）
```python
def normalize_answer(value: str) -> str:
    letters = sorted({c for c in value.upper() if c in 'ABCD'})
    return ''.join(letters)
```
**用途**：答辩时说明多选题判分逻辑，避免顺序误判。

### 2. 弱项加权逻辑（backend/routes/plans.py:59-64）
```python
def subject_priority(subject, weak_map):
    score = float(subject['weight']) * float(subject['difficulty'])
    weak = weak_map.get(subject['id'])
    if weak and weak['total_answers'] >= 5 and weak['accuracy'] < 60:
        score *= 1.5
    return score
```
**用途**：展示计划生成算法的核心——弱项加权 50%。

### 3. 三阶段划分（backend/routes/plans.py:67-89）
```python
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
```
**用途**：展示备考周期自动划分逻辑。

### 4. 每日任务生成（backend/routes/plans.py:92-126）
```python
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
```
**用途**：展示每日任务如何根据优先级轮询生成。

### 5. 推荐匹配度（backend/routes/recommendations.py:38-42）
```python
def match_score(accuracy, total_answers):
    base = max(50, min(98, int(100 - (accuracy or 50))))
    if total_answers and total_answers < 5:
        base = max(base, 75)
    return base
```
**用途**：展示推荐系统的匹配度计算逻辑。

### 6. 答题后弱项更新（backend/routes/answers.py:50-70）
```python
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
```
**用途**：展示弱项实时更新机制。

### 7. 计划与进度联动（backend/routes/plans.py:435-479）
```python
if is_completed and item_date:
    cursor.execute("""
        SELECT id, study_minutes, completed_items
        FROM progress
        WHERE user_id = %s AND record_date = %s
    """, (user_id, item_date))
    progress = cursor.fetchone()
    # ... 自动累加学习时长和完成项数
elif not is_completed and item_date:
    # ... 取消完成时回退进度
```
**用途**：展示标记任务完成如何自动更新学习进度。

## 三、数据库结构

### 题目表（frontend/assets/init_db.sql:88-102）
```sql
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    resource_id INT,
    type VARCHAR(16) NOT NULL,
    content TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer VARCHAR(16) NOT NULL,
    explanation TEXT,
    tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL,
    CHECK (type IN ('单选', '多选', '判断'))
);
```

### 弱项表（frontend/assets/init_db.sql:153-164）
```sql
CREATE TABLE weak_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    accuracy DOUBLE NOT NULL DEFAULT 0,
    total_answers INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE KEY uq_weak_user_subject (user_id, subject_id)
);
```

### 推荐表（frontend/assets/init_db.sql:166-177）
```sql
CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(16) NOT NULL,
    target_id INT NOT NULL,
    reason TEXT,
    is_viewed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (type IN ('resource', 'question'))
);
```

## 四、前端关键代码

### 统计页 SVG 折线图生成（frontend/js/statistics.js:7-47）
```javascript
function buildLineChartSvg(labels, values, maxVal, unitLabel) {
    const max = maxVal || Math.max(...values, 1);
    const plotH = 120;
    const baseY = 150;
    const startX = 60;
    const endX = 492;
    const step = values.length > 1 ? (endX - startX) / (values.length - 1) : 0;

    const points = values.map((v, i) => {
        const x = startX + i * step;
        const y = baseY - (v / max) * plotH;
        return { x, y };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
    // ...
}
```
**用途**：展示前端如何用纯 SVG 实现数据可视化。

### 推荐页渲染（frontend/js/recommendations.js:71-106）
```javascript
function renderRecommendations(items) {
    const container = document.getElementById('reco-list');
    if (!items.length) {
        container.innerHTML = `
            <div class="empty-visual">
                <p class="muted">暂无推荐 📭 先去题库完成几道练习吧</p>
                <a class="btn primary" href="qa.html">✍️ 开始练习</a>
            </div>`;
        return;
    }
    // ... 渲染推荐卡片
}
```
**用途**：展示推荐页的冷启动引导设计。

## 五、PRD 需求对应

### 模块 4：题库与练习（PRD:110-116）
> "按科目/知识点浏览题目、单题答题（单选/多选/判断）、提交答案并记录正确性、保存答题历史、自动统计各科目正确率，识别弱项"

### 模块 5：学习进度跟踪（PRD:118-122）
> "记录每日任务完成情况、统计已完成天数、总学习时长、答题数量、可视化展示（进度条、饼图/柱状图）"

### 模块 6：个性化推荐（PRD:124-127）
> "根据弱项科目推荐相关学习资源、根据错题知识点推荐同类练习题、推荐逻辑基于规则（如：正确率 < 60% 的科目优先推荐）"

### 模块 7：题目解析与答疑（PRD:129-132）
> "每道题提供详细解析和答题技巧、用户可对题目提交疑问、管理员/系统可回复"
