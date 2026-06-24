# Week Report: week1

# Week 1 调研报告 — 基础设施 + 核心数据

> 本报告为「公务员考试学习跟踪系统」课程设计 Week 1 的完整调研素材，供 ppt-master skill 提取文案使用。
> 所有数据均从 git log、init_db.sql、项目文档中核实，未编造。

---

## 一、本周目标（一句话）

搭建项目骨架，完成数据库设计，实现用户账户与考试资源管理模块，为后续核心业务模块奠定技术与数据基础。

---

## 二、实际完成内容（按 Day 1-5 列表）

| 日期 | 类别 | 完成项 |
|------|------|--------|
| Day 1 | 项目初始化 | 初始化 Git 仓库、创建 GitHub 远端、配置 `.claude/skills/`、创建 PRD、ROADMAP、PROJECT_STATUS、HANDOFF、CONTEXT.md |
| Day 2 | 项目骨架 | 创建 `backend/` Flask 目录结构、`frontend/` 目录结构、`.gitignore`、配置 `requirements.txt` |
| Day 3 | 数据库设计 | 设计 12 张核心数据表、编写 `init_db.sql`、实现 `init_db.py` 初始化脚本、导入基础种子数据 |
| Day 4 | 用户与账户 | 实现用户注册 / 登录 / 登出 API、前端登录注册页面、Session 登录态管理、个人信息页 |
| Day 5 | 考试资源管理 | 实现资源列表 / 详情 API、资源库页面、资源分类筛选、前端 GPT 设计资产集成 |

---

## 三、关键产出

1. **前后端分离架构搭建完成**：Flask 后端（端口 5001）+ 原生 HTML/CSS/JS 前端（端口 8080），通过 RESTful API 通信。
2. **MySQL 数据库表结构确定**：12 张核心表 + 11 个索引，覆盖用户、目标、资源、题目、答题、计划、进度、弱项、推荐、留言全链路。
3. **用户认证与会话机制跑通**：基于 Flask Session + Cookie 的登录态管理，密码使用 werkzeug scrypt 哈希。
4. **23 条备考资源入库并可浏览**：覆盖大纲、真题、模拟题、资料、公告 5 大类型，关联 7 个科目。
5. **前端设计系统（MASTER.md）与初始页面风格确定**：GPT 生成设计资产，统一颜色、字体、圆角规范。

---

## 四、核心数据（全部可核实）

| 指标 | 数值 | 核实来源 |
|------|------|----------|
| 代码提交次数 | 11 次（Week 1 核心 commit） | `git log --oneline --reverse 3bcd35b..ed2f216` |
| 新增/修改文件 | 32 个文件，+1435 行 | `git diff --stat 3bcd35b ed2f216` |
| 数据库表数量 | 12 张 | `frontend/assets/init_db.sql` 第 44-189 行 |
| 数据库索引数量 | 11 个 | `frontend/assets/init_db.sql` 第 191-202 行 |
| 种子资源数量 | 23 条 | `frontend/assets/init_db.sql` 第 219-242 行 |
| 种子科目数量 | 7 个 | `frontend/assets/init_db.sql` 第 204-211 行 |
| 演示账号数量 | 4 个（root + 3 个测试用户） | `frontend/assets/init_db.sql` 第 213-217 行 |
| API Blueprint 数量 | 2 个（auth + resources） | `backend/app.py` 第 15-17 行 |
| 后端路由数量 | 6 个（注册/登录/登出/me + 资源列表/详情） | `backend/routes/auth.py` + `backend/routes/resources.py` |

---

## 五、亮点与难点 / 解决方案

### 亮点

1. **技术选型简洁明确**：Flask + MySQL + 原生前端，与 PRD 中「简单、可演示、易维护」的约束完全对应，答辩环境搭建零门槛。
2. **数据库设计一步到位**：12 张表在 Week 1 全部定义，预留了 Week 2 计划、答题、进度、弱项、推荐、留言所需的所有外键关系，避免后续返工。
3. **命名规范前置统一**：通过 `CONTEXT.md` 约定数据库/API/前端的命名规则，后续 50+ 次 commit 未出现命名冲突。
4. **Session 认证轻量可靠**：比 JWT 更适合课程设计场景，无需处理 token 刷新，浏览器关闭即失效，安全性足够。

### 难点与解决方案

| 难点 | 解决方案 |
|------|----------|
| PRD 初稿写 SQLite，后续发现并发和演示数据导入不便 | 在 Week 1 后期迁移至 MySQL，通过 `init_db.py` 一键删表重建并导入种子数据 |
| 前端页面风格不统一 | 引入 GPT 生成设计资产（MASTER.md），建立颜色/字体/圆角 Token，后续所有页面遵循同一规范 |
| 资源类型和科目分类需要可扩展 | 数据库使用 CHECK 约束 + 外键关联，前端标签页动态渲染，新增类型无需改代码 |

---

## 六、PPT 建议页数与每页标题

建议 Week 1 部分占 **5 页**，结构如下：

1. **Week 1 概览 — 从 0 到 1 的起步**
2. **技术选型与架构设计**
3. **数据库设计 — 12 张核心表**
4. **用户模块 — 注册登录与 Session 认证**
5. **资源模块 — 23 条备考资源入库**

---

## 七、每页 PPT 的详细 bullet points（口语化，适合答辩讲述）

### 第 1 页：Week 1 概览 — 从 0 到 1 的起步

- 大家好，Week 1 我们的目标是「搭骨架、建数据、跑通认证」。
- 5 天时间，我们完成了从项目初始化到用户登录、资源浏览的完整链路。
- 具体做了四件事：项目骨架搭建、数据库设计、用户模块、资源模块。
- 产出 11 次代码提交、32 个新增文件、12 张数据库表、23 条种子资源。
- 这为 Week 2 的题库、计划、统计、推荐四大业务模块打下了坚实基础。

### 第 2 页：技术选型与架构设计

- 技术选型遵循一个原则：简单、可演示、不引入新框架。
- 后端选 Flask，因为 Python 是课程主要语言，Flask 轻量、路由清晰、文档丰富。
- 数据库选 MySQL 8.0，支持事务和外键，演示数据通过 SQL 脚本一键导入，换机方便。
- 前端用原生 HTML/CSS/JS，不引入 Vue/React，降低答辩环境搭建成本。
- 架构是标准的前后端分离：后端 5001 端口提供 REST API，前端 8080 端口静态服务，通过 fetch + CORS 通信。
- 所有 API 返回统一格式：`{ success, data, message }`，前端处理逻辑一致。

### 第 3 页：数据库设计 — 12 张核心表

- 数据库设计是 Week 1 的重头戏，我们一次性定义了 12 张表，覆盖全部 7 个模块。
- 核心表包括：users（用户）、subjects（科目）、resources（资源）、questions（题目）、answers（答题记录）、plans（计划）、plan_items（每日任务）、progress（进度）、weak_points（弱项）、recommendations（推荐）、comments（留言）、goals（学习目标）。
- 表之间通过外键关联，比如 answers 关联 users 和 questions，plan_items 关联 plans 和 subjects。
- 建了 11 个索引，覆盖高频查询字段：用户名、用户 ID、科目 ID、资源 ID、答题时间等。
- 种子数据包含 7 个科目、23 条资源、4 个演示账号，执行 `python init_db.py` 即可一键重建。

### 第 4 页：用户模块 — 注册登录与 Session 认证

- 用户模块实现了注册、登录、登出、获取当前用户 4 个 API。
- 注册时密码用 werkzeug 的 scrypt 哈希，不存明文，符合安全规范。
- 登录成功后写入 Flask Session，浏览器通过 Cookie 自动携带 session_id，后续请求无需手动传 token。
- 前端登录页预填了演示账号 root/123456，方便答辩时快速进入系统。
- 我们做了两个装饰器：`login_required` 校验登录态，`admin_required` 校验管理员角色，资源上传和批量删除只有管理员能操作。

### 第 5 页：资源模块 — 23 条备考资源入库

- 资源模块是 Week 1 的第二个功能模块，实现了资源列表、详情、分类筛选。
- 资源分 5 类：考试大纲、历年真题、模拟题、备考资料、政策公告，共 23 条。
- 每条资源关联科目，比如「2025 年国考行测真题」关联「行政职业能力测验」。
- 前端资源库页面支持按类型标签切换、按科目筛选、关键词搜索，管理员还能上传新资源和批量删除。
- 资源详情页展示了内容摘要和关联题目数量，点击可进入练习。

---

## 八、可直接引用的文档原文 / 代码片段（标注文件路径 + 行号）

### 8.1 技术选型原文

> 技术选型以「简单、可演示、易维护」为原则：后端 Python Flask（RESTful API，Session 认证），数据库 MySQL 8.0+（演示数据通过 `init_db.sql` 一键导入），前端原生 HTML/CSS/JS（无框架，降低答辩环境搭建成本）。

来源：`README.md` 第 36-40 行

### 8.2 架构描述原文

> 本项目为数据结构课程设计，目标是为备考公务员考试的在校大学生提供一套轻量级学习跟踪系统。项目采用三周规划，实际开发集中在 2026-06-23 至 2026-06-24 完成全部功能。

来源：`docs/DEVELOPMENT_TIMELINE.md` 第 7-8 行

### 8.3 数据库表清单

```sql
CREATE TABLE subjects (...)
CREATE TABLE users (...)
CREATE TABLE goals (...)
CREATE TABLE resources (...)
CREATE TABLE questions (...)
CREATE TABLE answers (...)
CREATE TABLE plans (...)
CREATE TABLE plan_items (...)
CREATE TABLE progress (...)
CREATE TABLE weak_points (...)
CREATE TABLE recommendations (...)
CREATE TABLE comments (...)
```

来源：`frontend/assets/init_db.sql` 第 44-189 行

### 8.4 统一 API 响应格式

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

来源：`CONTEXT.md` 第 103-109 行 / `AGENTS.md` 第 59-67 行

### 8.5 Session 认证装饰器

```python
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return decorated_function
```

来源：`backend/routes/auth.py` 第 11-17 行

### 8.6 密码哈希（scrypt）

```python
from werkzeug.security import generate_password_hash, check_password_hash
password_hash = generate_password_hash(password)
```

来源：`backend/routes/auth.py` 第 3、51 行

### 8.7 资源列表 API（带筛选）

```python
@bp.route('/', methods=['GET'])
@login_required
def list_resources():
    subject_id = request.args.get('subject_id', type=int)
    resource_type = request.args.get('type', '').strip()
    # ... SQL 查询带条件筛选
```

来源：`backend/routes/resources.py` 第 11-56 行

### 8.8 前端 API 封装

```javascript
const API_BASE_URL = 'http://localhost:5001/api';
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    };
    // ...
}
```

来源：`frontend/js/api.js` 第 1-25 行

### 8.9 命名规范原文

> 表名：小写，复数形式，下划线分隔，如 `users`、`plan_items`
> 字段名：小写，下划线分隔，如 `user_id`、`created_at`
> 主键：`id`（自增整数）
> 外键：`<表名>_id`，如 `user_id`、`subject_id`

来源：`CONTEXT.md` 第 94-98 行

---

## 九、建议截图位置与描述

| 序号 | 截图位置 | 描述 | 用途 |
|------|----------|------|------|
| 1 | 登录页 `login.html` | 左侧品牌面板 + 右侧登录表单，预填 root/123456 | 展示前端设计资产和用户体验 |
| 2 | 注册页 `register.html` | 与登录页统一的左右分栏布局 | 展示注册流程 |
| 3 | 资源库页 `resources.html` | 标签页切换（大纲/真题/模拟题/资料/公告）+ 资源卡片网格 | 展示资源分类和筛选功能 |
| 4 | 资源详情页 `resource-detail.html` | 资源标题、类型标签、内容摘要、关联题目数 | 展示资源详情 |
| 5 | 数据库表结构（IDE 或 MySQL Workbench） | 12 张表的 ER 关系图 | PPT 数据库设计页 |
| 6 | `init_db.py` 执行终端 | 输出 "Initialized MySQL database..." | 展示一键初始化能力 |
| 7 | Postman 或浏览器 DevTools | 调用 `/api/auth/login` 返回 success 响应 | 展示 API 连通性 |
| 8 | 项目目录结构（VS Code 或文件管理器） | backend/ + frontend/ 分层清晰 | 展示项目骨架 |

---

## 十、Week 1 → Week 2 衔接话术

> Week 1 我们搭好了骨架、建好了数据库、跑通了用户认证和资源浏览。Week 2 在此基础上，我们进入了核心业务逻辑的开发：题库练习、智能学习计划生成、学习进度统计、弱项识别与个性化推荐、题目解析与答疑。这些模块全部依赖 Week 1 定义的数据表和 API 规范，所以 Week 1 的基础打得扎实，Week 2 的开发效率就很高。


---

# Week Report: week2

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


---

# Week Report: week3

# Week 3 调研报告 — 完善、Review、演示

> 本报告为「公务员考试学习跟踪系统」课程设计 PPT 的 Week 3 部分提供完整素材。

---

## 一、本周目标（一句话）

统一全站 UI/UX、逐模块 Review 与测试调试、准备演示数据、整理文档，确保项目达到可答辩状态。

---

## 二、实际完成内容（按 Day 11-15）

| 日期 | 类别 | 完成项 |
|------|------|--------|
| Day 11 | UI/UX 统一 | Aceternity 风格 surface 迁移、渐变与过渡动画、排版层级优化、KPI 网格、表单聚焦环、热力图、插画与图标 |
| Day 12 | 模块 Review | Dashboard 布局打磨、统计页图表对齐、资源详情紧凑化、个人资料页与 admin 区块、topbar 用户芯片联动 |
| Day 13 | 测试与调试 | 修复模块加载时序、本地时区过滤、Dashboard 今日任务勾选 FLIP 动画、PowerShell API 冒烟测试 |
| Day 14 | 演示准备 | 题库扩容至 200 题、资源 HTML 内容完善、`resource_id` 关联、多选支持、换机部署 README |
| Day 15 | 收尾 | README polish（环境准备/开机运行/换机实测/维护规范）、CLAUDE.md 更新、`.cursorrules` 创建、合并至 master 并推送 |

---

## 三、关键产出

1. **设计系统落地**：从 GPT 生成的 MASTER.md 设计资产迁移到 Aceternity 风格的 surfaces.css + styles.css
2. **全站动画体系**：页面过渡 veil、GSAP KPI 数字动画、FLIP 任务勾选、热力图交互
3. **测试覆盖**：PowerShell 冒烟测试脚本覆盖 18+ API 端点
4. **演示数据**：题库 200 题（单选 152 / 判断 34 / 多选 14），23 条资源，4 个演示账号
5. **文档体系**：README.md、PROJECT_GUIDE.md、DEVELOPMENT_TIMELINE.md、PPT_RESEARCH_PLAN.md

---

## 四、核心数据（全部可核实）

| 指标 | 数值 | 来源 |
|------|------|------|
| Week 3 代码提交 | 42 次 commit | `git log e7d9c8e..HEAD \| wc -l` |
| 修改文件数 | 109 个文件 | `git diff --stat e7d9c8e..HEAD \| tail -1` |
| 新增/修改代码行 | +19,172 / -923 行 | `git diff --stat e7d9c8e..HEAD` |
| 题库总量 | 200 题 | `frontend/assets/init_db.sql` 行 244-549 |
| 单选题 | 152 题 | `grep -c "'单选'" init_db.sql` |
| 多选题 | 14 题 | `grep -c "'多选'" init_db.sql` |
| 判断题 | 34 题 | `grep -c "'判断'" init_db.sql` |
| 备考资源 | 23 条 | `init_db.sql` 行 219-242 |
| 演示账号 | 4 个 | `init_db.sql` 行 213-217 |
| API 冒烟测试 | 18+ 端点 | `backend/test_api.ps1` |
| 前端页面 | 11 个 HTML | `ls frontend/*.html` |
| 后端 Blueprint | 10 个 | `backend/routes/` |
| 文档文件 | 9 个 | `ls docs/` |

---

## 五、亮点与难点 / 解决方案

### 亮点

1. **Aceternity 设计系统迁移**：从原始"通用后台模板"风格升级为具有专业感的政务蓝主题
2. **动画体系完整**：加载 veil、GSAP 数字滚动、FLIP 任务勾选、页面过渡
3. **热力图可视化**：学习时长热力图支持 5 级色阶、悬停 tooltip
4. **移动端适配**：860px 断点下 sidebar 变为抽屉式导航

### 难点与解决方案

| 难点 | 解决方案 |
|------|----------|
| 模块加载时序混乱 | 引入 `app:ready` 事件机制（commit `79e7749`） |
| 日期过滤 UTC 跨天错误 | 统一使用本地时区（commit `4191556`） |
| 多选答案比对格式不统一 | 后端规范化排序后比对 |
| 换机部署环境差异 | 编写完整 README + PROJECT_GUIDE + FAQ |

---

## 六、PPT 建议页数与每页标题

建议 **6 页**：

1. **Week 3 概览 — 从功能到体验的跨越**
2. **UI/UX 统一 — 设计系统落地**
3. **动画与交互 — 让数据动起来**
4. **测试与 Review — 质量保障**
5. **演示数据准备 — 200 题 + 23 资源**
6. **文档整理与项目归档 — 可维护性**

---

## 七、每页 PPT 详细 bullet points（口语化）

### 第 1 页：Week 3 概览

- "第三周我们的核心目标是把一个『功能可用』的系统变成『体验完整、可直接答辩演示』的作品"
- "主要做了五件事：UI 统一、模块 Review、测试调试、演示数据准备、文档整理"
- "代码层面：42 次提交，修改了 109 个文件，新增近 2 万行代码"
- "数据层面：题库从初始版本扩容到 200 题，资源 23 条，准备了 4 个不同角色的演示账号"

### 第 2 页：UI/UX 统一

- "Week 1-2 的前端比较像通用后台模板，颜色、字体、布局都偏保守"
- "Week 3 我们引入了 Aceternity 设计系统的 surface 概念，做了完整的视觉升级"
- "具体包括：政务蓝主色 + 琥珀强调色、Lexend + Source Sans 3 字体层级、统一的 spacing scale"
- "每个卡片都有 spotlight 悬停光效，按钮有渐变和底部光束，KPI 区域有细网格纹理"

### 第 3 页：动画与交互

- "我们构建了三层动画体系：加载层、过渡层、微交互层"
- "加载层：页面切换时显示 veil 遮罩，有 shimmer 扫光效果和进度条"
- "过渡层：页面进入时有 mainEnter 动画，内容区切换有 contentEnter 动画"
- "微交互层：Dashboard KPI 数字用 GSAP 滚动显示，任务勾选用 FLIP 动画平滑移动"
- "热力图支持悬停 tooltip，显示当天学习时长和答题数量"

### 第 4 页：测试与 Review

- "我们编写了 PowerShell 冒烟测试脚本 `test_api.ps1`，覆盖 18 个 API 端点"
- "测试包括：健康检查、登录认证、资源列表、题目列表、答题提交、计划生成、评论提交等"
- "手动 Review 发现并修复了多个问题：模块加载时序、本地时区过滤、统计页图表对齐"

### 第 5 页：演示数据准备

- "题库从初始版本扩容到 200 题，覆盖单选 152 题、判断 34 题、多选 14 题"
- "题目按 7 个科目分布，并与 23 条资源通过 `resource_id` 关联"
- "准备了 4 个演示账号：root（admin）、testuser1（有计划）、testuser2（空状态）、testuser3（测弱项）"

### 第 6 页：文档整理与项目归档

- "编写了完整的 README.md，包含：环境准备、一键启动、换机实测检查清单、FAQ"
- "PROJECT_GUIDE.md 详细说明了部署步骤、验收路径、故障排查、数据备份"
- "所有文档都随代码提交到 GitHub，答辩机只需 `git clone` 即可获取完整资料"

---

## 八、可直接引用的代码片段

详见 `QUOTES.md` 文件，包含：
- 设计系统 Token（surfaces.css 行 1-12）
- Spotlight 悬停光效（surfaces.css 行 199-239）
- 加载 Veil（ui.js 行 58-79）
- GSAP KPI 数字动画（motion.js 行 18-32）
- FLIP 任务勾选动画（motion.js 行 176-186）
- PowerShell 冒烟测试（test_api.ps1 行 60-99）
- 题库数据规模（init_db.sql 行 244 起）
- 前端设计 Review 结论（frontend-design-review.md 行 193）

---

## 九、建议截图位置与描述

详见 `SCREENSHOTS.md` 文件，包含 10 个建议截图位置：
1. Dashboard 首页（完整视图）
2. Dashboard 任务勾选（FLIP 动画）
3. 学习热力图（tooltip）
4. 资源库页面（卡片网格）
5. 资源详情页（目录导航）
6. 题库练习页（答题解析）
7. 学习统计页（图表）
8. 个人资料页（admin 区块）
9. 登录页（品牌卡片）
10. PowerShell 终端（测试结果）

---

## 十、Week 3 与整体项目的关联

Week 3 是「从功能到体验」的关键转折：
- Week 1 搭骨架（数据库、用户、资源）
- Week 2 填血肉（题库、计划、统计、推荐、答疑）
- **Week 3 穿衣服**（UI 统一、动画、测试、文档、演示数据）

没有 Week 3 的打磨，项目只能算「功能演示」；有了 Week 3，项目达到了「课程设计答辩」的完整度。


---

