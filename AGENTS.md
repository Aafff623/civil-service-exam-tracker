# AGENTS.md — Agent Team 规范

> 本文件供 Cursor / Claude Code / 其他 Agent 接续开发时阅读。与 `CLAUDE.md` 互补：`CLAUDE.md` 是项目概览，`AGENTS.md` 是协作规范与路由地图。

## 项目概览

- **名称**：公务员考试学习跟踪系统（课程设计）
- **技术栈**：Flask + MySQL 8.0+（PyMySQL）+ 原生 HTML/CSS/JS
- **架构**：前后端分离，RESTful API，Session 认证
- **后端端口**：5001（本地 5000 被占用）
- **前端端口**：8080（`python -m http.server`）
- **领域词汇**：见根目录 `CONTEXT.md`
- **需求文档**：`PRD-civil-service-exam-tracker.md`

## 启动与维护脚本

| 操作 | 命令 | 说明 |
|------|------|------|
| 初始化数据库 | `cd backend && python init_db.py` | 连接 MySQL，删表重建并执行 `frontend/assets/init_db.sql` 种子数据 |
| 启动后端 | `cd backend && python app.py` | Flask debug，监听 5001 |
| 启动前端 | `cd frontend && python -m http.server 8080` | 静态文件服务 |
| 健康检查 | `GET http://localhost:5001/api/health` | 无需登录 |

**注意**：运行时数据存于 MySQL 数据库 `civil_service_exam`；改表结构后需重新 `init_db.py`。（`backend/database.db` 为早期 SQLite 遗留文件，已弃用、未提交，列在 `.gitignore` 中。）

## 文件命名规范

### 后端

| 类型 | 规范 | 示例 |
|------|------|------|
| 路由模块 | `backend/routes/<resource>.py`，Blueprint 名与资源一致 | `auth.py`, `questions.py` |
| URL 前缀 | `/api/<resource>`，复数形式 | `/api/questions`, `/api/answers` |
| 数据库表 | 小写复数，下划线分隔 | `users`, `plan_items`, `weak_points` |
| 字段 | 小写下划线；主键 `id`；外键 `<table>_id` | `user_id`, `created_at` |
| 配置 | `backend/config.py` / `backend/.env` | `MYSQL_HOST/PORT/USER/PASSWORD/DATABASE`, `SECRET_KEY` |

### 前端

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面 HTML | 与功能同名，放 `frontend/` 根目录 | `dashboard.html`, `qa.html` |
| 全局样式 | `frontend/assets/styles.css` | **主样式文件**（GPT 资产集成后） |
| 演示脚本 | `frontend/assets/app.js` | 静态演示交互（日期、demo 按钮） |
| API 封装 | `frontend/js/api.js` | 所有 `fetch` 调用，`API_BASE_URL = http://localhost:5001/api` |
| 页面逻辑 | `frontend/js/<page>.js` 或 `app.js` | `qa.js`, `auth.js` |
| 设计系统 | `design-system/公务员考试学习跟踪系统/MASTER.md` | ui-ux-pro-max 生成的设计 Token |

### Issue / 文档

| 类型 | 路径 | 规范 |
|------|------|------|
| 功能 Issue | `.scratch/<feature-slug>/issues/<NN>-<slug>.md` | 从 `01` 编号 |
| 功能 PRD | `.scratch/<feature-slug>/PRD.md` | 可选 |
| 交接文档 | `docs/HANDOFF.md` | 每次会话结束更新 |
| 进度跟踪 | `docs/PROJECT_STATUS.md` | 每完成一模块更新 |
| 架构决策 | `docs/adr/` | 非平凡决策时新增 ADR |

### API 响应格式（统一）

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

列表接口：`data.items` + 可选分页字段（`total`, `page`, `per_page`）。

## 后端路由地图

| Blueprint | 前缀 | 认证 | 端点 | 状态 |
|-----------|------|------|------|------|
| `health` | `/api/health` | 否 | `GET /`, `GET ''` | ✅ |
| `auth` | `/api/auth` | 部分 | `POST /register`, `POST /login`, `POST /logout`, `GET /me` | ✅ |
| `resources` | `/api/resources` | 是 | `GET /`, `GET /<id>`, `POST /`, `DELETE /<id>`, `POST /batch-delete` | ✅ |
| `subjects` | `/api/subjects` | 是 | `GET /`, `POST /` | ✅ |
| `questions` | `/api/questions` | 是 | `GET /`, `GET /<id>` | ✅ |
| `answers` | `/api/answers` | 是 | `POST /`, `GET /history` | ✅ |
| `plans` | `/api/plans` | 是 | `GET/POST /goal`, `GET /`, `POST /generate`, `GET /items`, `PATCH /items/<id>`, `GET /subjects` | ✅ |
| `progress` | `/api/progress` | 是 | `GET /` | ✅ |
| `recommendations` | `/api/recommendations` | 是 | `GET /` | ✅ |
| `goals` | （并入 `/api/plans/goal`） | 是 | 学习目标读写由 `plans` 蓝图提供，无独立蓝图 | ✅ |
| `comments` | `/api/comments` | 是 | `GET /`, `POST /` | ✅ |

认证方式：Flask Session + Cookie，`login_required` 装饰器（`routes/auth.py`）。

## 前端页面地图

| 页面 | 路径 | API 接入 | 脚本引用 |
|------|------|----------|----------|
| 项目总览 | `index.html` | 无 | `assets/app.js` |
| 首页/仪表盘 | `dashboard.html` | `/auth/me` + 计划/进度/推荐 | `api.js` + `app.js` + `dashboard.js` |
| 登录/注册 | `login.html`, `register.html` | `/auth/*` | `api.js` + `auth.js` |
| 资源库 | `resources.html` | `/resources/`, `/subjects/` | `api.js` + `app.js` |
| 题库练习 | `qa.html` | `/questions/`, `/answers/` | `api.js` + `app.js` + `qa.js` |
| 学习计划 | `plan.html` | `/plans/*` | `api.js` + `app.js` + `plan.js` |
| 学习推荐 | `recommendations.html` | `/recommendations/` | `api.js` + `app.js` + `recommendations.js` |
| 学习统计 | `statistics.html` | `/progress/` | `api.js` + `app.js` + `statistics.js` |
| 资源详情 | `resource-detail.html` | `/resources/<id>`, `/questions/` | `api.js` + `app.js` + `resource-detail.js` |
| 个人中心 | `profile.html` | `/auth/me` | `api.js` + `app.js` + `profile.js` |

**已接入页面**需引用 `js/api.js` + `js/app.js`（`app.js` 含登录检查和退出按钮）。

**遗留文件**（旧版，当前主流程不用）：`frontend/css/style.css`, `frontend/js/resources.js`。

**资产副本**：`frontend/assets/*.html` 是 GPT 原型原始副本，链接仍指向 `overview.html` / `index.html`，**以 `frontend/` 根目录页面为准**。

## Agent 工作流

实现新模块时遵循 `docs/agents/module-development-workflow.md`：

1. **Before**：在 `.scratch/<module>/issues/` 建 Issue，写清 Goal + Acceptance criteria + API 契约
2. **During**：TDD 或至少 API 手动验证；只用 `CONTEXT.md` 领域词汇；手术式改动
3. **After**：更新 `PROJECT_STATUS.md` + `HANDOFF.md`；一模块一 commit（Conventional Commits）；推送 GitHub

### Triage 标签

`needs-triage` | `needs-info` | `ready-for-agent` | `ready-for-human` | `wontfix`

详见 `docs/agents/triage-labels.md`。

### 领域文档

开发前先读 `CONTEXT.md`；有架构分歧时写 `docs/adr/`。详见 `docs/agents/domain.md`。

## 当前进度（2026-06-24）

### 已完成模块

1. 用户与账户（注册/登录/登出/个人信息）
2. 考试资源管理（列表/筛选/详情）
3. 题库与练习（题目列表、答题、历史、弱项统计）
4. GPT 前端设计资产集成
5. 智能学习计划生成
6. 学习进度跟踪与统计
7. 个性化推荐
8. Dashboard 接入 + 答疑留言 API

### 进行中 / 待办（按优先级）

1. **集中 Review** — 用户主导排 bug
2. **可选优化** — AI 答疑 LLM、考试时间线、SVG 图标

### 已知技术债

- AI 答疑为规则演示；考试时间线仍为静态
- emoji 图标未替换 SVG
- 无 favicon（404 不影响功能）

## 接续开发检查清单

接手新会话时：

- [ ] 读 `docs/HANDOFF.md`（最新上下文）
- [ ] 读 `docs/PROJECT_STATUS.md`（完成度）
- [ ] 读 `CONTEXT.md`（领域词汇）
- [ ] 确认 `backend` 5001 + `frontend` 8080 可访问
- [ ] 选定下一模块，在 `.scratch/` 建 Issue 后再写代码
- [ ] 完成后更新 HANDOFF + PROJECT_STATUS + 提交推送