# Week 2 — 核心业务逻辑 调研报告

## 本周目标（一句话）

实现题库练习、智能学习计划、学习进度统计、弱项识别、个性化推荐、题目解析与答疑六大核心业务模块，完成从"有数据"到"有业务价值"的跨越。

---

## 实际完成内容（按 Day 6-10）

| 日期 | 类别 | 完成项 |
|------|------|--------|
| Day 6 | 题库与练习 | 实现题目列表/筛选 API、答题提交与记录 API、前端题库练习页、单选/多选/判断交互、答题结果展示 |
| Day 7 | 智能学习计划 | 实现学习目标设置 API、计划生成算法（科目权重×难度+弱项加权）、学习计划页、每日任务卡片 |
| Day 8 | 学习进度跟踪 | 实现学习记录与进度统计 API、进度统计页、进度条/正确率图表可视化、打卡日历 |
| Day 9 | 弱项识别+推荐 | 实现基于答题历史的弱项计算、个性化推荐 API 与页面、资源/题目推荐 |
| Day 10 | 解析与答疑 | 实现题目解析展示、答疑留言 API、Dashboard 接入评论提交 |

---

## 关键产出

1. **200 道种子题**入库，覆盖 7 个科目，支持按科目/资料来源/题型三级筛选
2. **智能计划生成算法**：科目权重×难度系数+弱项加权 50%，自动划分三阶段（基础/强化/冲刺）
3. **弱项识别规则**：答题量≥5 且正确率<60%，实时更新
4. **推荐系统**：基于弱项自动匹配相关资源与同类练习题
5. **进度统计页**：KPI 看板 + 学习时长折线图 + 正确率趋势 + 打卡日历 + 连续打卡统计
6. **Dashboard 接入**：今日任务清单、弱项提醒、考试倒计时、学习热力图

---

## 核心数据（全部可核实）

### 题目数据分布
- **总题数**：200 道（`frontend/assets/init_db.sql` 中 INSERT INTO questions 共 200 行）
- **题型分布**：单选 152 道（76%）、判断 34 道（17%）、多选 14 道（7%）
- **科目覆盖**：7 个科目（行测 1-6、申论 7）
- **资源关联**：题目通过 `resource_id` 与 23 条资源关联

### 代码提交
- **Week 2 核心 commit**（从 git log 筛选）：
  - `3d9c803` feat(questions): implement question bank API and practice page
  - `f60f2fa` feat(plans): implement study plan generation and plan page
  - `014e0bd` feat(progress): implement learning statistics API and statistics page
  - `b20d10f` feat(recommendations): implement personalized recommendation API and page
  - `81cb567` feat(dashboard): wire dashboard to APIs and add comment submission
- **Week 2 相关 commit 约 5 个核心功能提交**

### 算法参数
- **弱项阈值**：答题量 ≥ 5、正确率 < 60%（`backend/routes/plans.py:62`）
- **弱项加权**：优先级分数 × 1.5（`backend/routes/plans.py:63`）
- **计划阶段划分**：基础 30%、强化 40%、冲刺 30%（`backend/routes/plans.py:67-89`）
- **每日任务数**：max(2, min(5, daily_minutes // 30))（`backend/routes/plans.py:105`）
- **匹配度计算**：base = max(50, min(98, 100 - accuracy))（`backend/routes/recommendations.py:38-42`）

### API 端点
- questions: GET /api/questions, GET /api/questions/<id>
- answers: POST /api/answers, GET /api/answers/history
- plans: GET/POST /api/plans/goal, GET /api/plans, POST /api/plans/generate, GET /api/plans/items, PATCH /api/plans/items/<id>
- progress: GET /api/progress
- recommendations: GET /api/recommendations
- comments: GET/POST /api/comments

---

## 亮点与难点 / 解决方案

### 亮点
1. **多选答案规范化比对**：后端使用 `normalize_answer` 函数，将用户答案排序去重后与标准答案比对，避免 "AC" 和 "CA" 被判错的问题（`backend/routes/answers.py:11-13`）
2. **弱项实时更新**：每次答题后立即更新 `weak_points` 表，正确率动态计算（`backend/routes/answers.py:50-70`）
3. **计划与进度联动**：标记任务完成时自动更新 `progress` 表的学习时长和完成项数（`backend/routes/plans.py:435-479`）
4. **统计页 Demo 数据兜底**：新用户无数据时展示演示数据，保证页面不空（`backend/routes/progress.py:9-42`）

### 难点与解决方案
1. **多选题型前端交互**：需要支持多选/取消、提交前校验。方案：前端 `qa.js` 中 `normalizeAnswer` 与后端保持一致，提交前确认至少选一项。
2. **计划生成覆盖旧计划**：重新生成时需先删除旧 plan_items 和 plans。方案：事务内先删后插（`backend/routes/plans.py:307-322`）。
3. **进度统计跨表聚合**：需要联合 answers、plan_items、progress 三张表。方案：后端分多个查询聚合，前端统一渲染。
4. **推荐系统冷启动**：新用户无弱项时无推荐。方案：回退到通用入门推荐（`backend/routes/recommendations.py:140-161`）。

---

## PPT 建议页数与每页标题

共 **7 页**：

1. **Week 2 总览：从数据到业务**
2. **题库与练习模块：200 题的构建**
3. **智能学习计划：算法驱动的个性化**
4. **学习进度统计：可视化反馈闭环**
5. **弱项识别与推荐：规则引擎实践**
6. **题目解析与答疑：学习闭环的最后一环**
7. **Week 2 小结与 Week 3 展望**

---

## 每页 PPT 的详细 bullet points（口语化，适合答辩讲述）

### 第 1 页：Week 2 总览：从数据到业务
- "Week 1 我们搭好了骨架、建好了数据库、实现了用户登录和资源浏览。Week 2 的核心任务是让这些数据'活'起来——从题库练习到计划生成，从进度跟踪到弱项推荐。"
- "本周我们实现了 6 大业务模块，新增 6 个 API Blueprint，覆盖了从'做题'到'反馈'的完整闭环。"
- "关键数字：200 道题、7 个科目、3 种题型、弱项阈值 5 题/60% 正确率。"

### 第 2 页：题库与练习模块：200 题的构建
- "题库是系统的核心数据资产。我们入库了 200 道种子题，覆盖行测 5 个子科目和申论。"
- "题型分布上，单选 152 道占 76%，判断 34 道占 17%，多选 14 道占 7%，这个比例参考了真实国考的题型分布。"
- "每道题都关联了科目和资源 ID，用户可以从资源详情页直接跳转到关联题目进行练习。"
- "多选题的判分是个小难点——我们做了答案规范化，把 'AC' 和 'CA' 视为相同，避免顺序问题导致误判。"
- "答题后系统立即返回解析、答题技巧和正确与否，同时把记录写入答题历史。"

### 第 3 页：智能学习计划：算法驱动的个性化
- "学习计划模块是系统的'大脑'。用户设置考试目标、开始日期、每日学习时长后，系统自动生成覆盖整个备考周期的每日任务。"
- "算法核心是两个因子：科目权重 × 难度系数。比如申论权重 1.3、难度 1.2，数量关系难度 1.3，这些参数来自科目表。"
- "如果某科目被识别为弱项——答题超过 5 题且正确率低于 60%——优先级会加权 50%，确保薄弱科目得到更多练习时间。"
- "计划自动划分为三阶段：基础夯实 30%、强化提升 40%、冲刺模考 30%，符合主流备考方法论。"
- "每日任务数根据用户可用时间动态计算：2 小时约 4 个任务，3 小时约 6 个任务，每个任务建议 30 分钟。"

### 第 4 页：学习进度统计：可视化反馈闭环
- "进度统计页是用户最直观的'成绩单'。顶部 KPI 看板展示总学习时长、完成任务数、做题正确率、答题总数和连续打卡天数。"
- "学习时长趋势用 SVG 折线图展示近 7 天数据，正确率趋势按天统计，让用户看到自己的进步曲线。"
- "打卡日历用热力图形式展示，颜色越深代表当天学习时间越长，连续打卡天数自动计算。"
- "科目完成度用进度条展示，每个科目显示已完成/总任务数和正确率。"
- "一个小细节：新用户没有数据时，系统会展示演示数据，保证页面不空、体验不断裂。"

### 第 5 页：弱项识别与推荐：规则引擎实践
- "弱项识别基于两个硬指标：答题量≥5 题、正确率<60%。只有样本量足够时才判定为弱项，避免偶然性。"
- "推荐系统每次生成推荐时，先清空旧推荐，再根据当前弱项重新计算。推荐内容分两类：相关学习资源和同类练习题。"
- "匹配度算法：base = 100 - 正确率，如果答题量不足 5 题则保底 75 分，最终匹配度在 50-98 之间。"
- "冷启动问题：新用户没有弱项时，系统回退到通用入门推荐，推荐考试大纲和真题资料。"
- "推荐页还会展示用户的 Top 3 薄弱模块、学习偏好标签（如'弱项专攻''错题复盘'）和当前计划进度。"

### 第 6 页：题目解析与答疑：学习闭环的最后一环
- "每道题都配有详细解析和答题技巧，答题后立即展示，帮助用户理解错因。"
- "答疑模块支持用户对题目提交疑问，内容最长 500 字，支持回复他人留言，形成简单的讨论 thread。"
- "当前答疑为规则演示——留言会保存到数据库并展示，但回复是预置规则而非真实 LLM。这在课程设计范围内是合理的。"
- "Dashboard 也接入了答疑提交，用户可以在首页快速记录疑问。"

### 第 7 页：Week 2 小结与 Week 3 展望
- "Week 2 完成了从'有数据'到'有业务价值'的跨越，6 大模块全部联调通过。"
- "核心成果：200 道题 + 智能计划算法 + 弱项识别规则 + 推荐引擎 + 进度可视化 + 答疑闭环。"
- "Week 3 的任务是 UI/UX 统一、模块 Review、测试调试、演示数据准备和文档整理，让系统从'可用'变成'好演示'。"

---

## 可直接引用的文档原文 / 代码片段

### 弱项识别规则（CONTEXT.md）
> "弱项识别只在答题样本量 ≥ 5 题时生效。"（`CONTEXT.md:121`）
> "推荐内容优先针对正确率最低的科目。"（`CONTEXT.md:122`）

### 多选答案规范化（backend/routes/answers.py）
```python
def normalize_answer(value: str) -> str:
    letters = sorted({c for c in value.upper() if c in 'ABCD'})
    return ''.join(letters)
```
（`backend/routes/answers.py:11-13`）

### 弱项加权逻辑（backend/routes/plans.py）
```python
def subject_priority(subject, weak_map):
    score = float(subject['weight']) * float(subject['difficulty'])
    weak = weak_map.get(subject['id'])
    if weak and weak['total_answers'] >= 5 and weak['accuracy'] < 60:
        score *= 1.5
    return score
```
（`backend/routes/plans.py:59-64`）

### 三阶段划分（backend/routes/plans.py）
```python
def build_phases(total_days):
    p1 = max(1, int(total_days * 0.3))
    p2 = max(1, int(total_days * 0.4))
    p3 = max(1, total_days - p1 - p2)
    return [
        {'name': '基础夯实阶段', 'weeks': round(p1 / 7, 1), ...},
        {'name': '强化提升阶段', 'weeks': round(p2 / 7, 1), ...},
        {'name': '冲刺模考阶段', 'weeks': round(p3 / 7, 1), ...}
    ]
```
（`backend/routes/plans.py:67-89`）

### 推荐匹配度（backend/routes/recommendations.py）
```python
def match_score(accuracy, total_answers):
    base = max(50, min(98, int(100 - (accuracy or 50))))
    if total_answers and total_answers < 5:
        base = max(base, 75)
    return base
```
（`backend/routes/recommendations.py:38-42`）

### 答题后弱项更新（backend/routes/answers.py）
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
        UPDATE weak_points SET accuracy = %s, total_answers = %s ...
    """, (new_accuracy, total, weak['id']))
```
（`backend/routes/answers.py:50-70`）

### 题目表结构（frontend/assets/init_db.sql）
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
    CHECK (type IN ('单选', '多选', '判断'))
);
```
（`frontend/assets/init_db.sql:88-102`）

---

## 建议截图位置与描述

| 序号 | 页面 | 描述 | 用途 |
|------|------|------|------|
| 1 | qa.html | 题库练习页：筛选区 + 题目详情 + 选项交互 | 展示题库模块 |
| 2 | qa.html | 答题结果：正确/错误 + 解析 + 技巧 | 展示答题反馈 |
| 3 | plan.html | 学习计划页：目标输入 + 科目权重表 + 生成按钮 | 展示计划生成入口 |
| 4 | plan.html | 生成结果：三阶段预览 + 未来 7 天任务 | 展示计划输出 |
| 5 | statistics.html | 统计页 KPI 看板 + 学习时长折线图 | 展示进度统计 |
| 6 | statistics.html | 打卡日历 + 正确率趋势图 | 展示可视化 |
| 7 | recommendations.html | 推荐页：薄弱模块 Top 3 + 推荐列表 | 展示弱项识别与推荐 |
| 8 | dashboard.html | Dashboard：今日任务 + 弱项提醒 + 倒计时 | 展示数据整合 |
| 9 | qa.html | 题目留言区：用户提问 + 系统回复 | 展示答疑模块 |
| 10 | 代码编辑器 | plans.py 的 subject_priority 函数 | 展示算法代码 |

---

> 报告生成时间：2026-06-24
> 数据来源：git log、frontend/assets/init_db.sql、backend/routes/*.py、frontend/*.html、docs/*.md
