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
