# LANGUAGES.md — 语言与术语

> **Output Style**：`humanizer-output-style` skill — 统一语气与去 AI 味。详见 `docs/agents/voice.md`。

本项目使用的语言、术语来源与命名规则。**领域词汇定义见 [`CONTEXT.md`](CONTEXT.md)**；本文件只讲语言层面与命名约定。

## 语言

- **自然语言**：中文为主（面向大一、大二学生 + 答辩老师）；技术术语、API 路径、代码标识符保留英文。
- **文档语气**：平实、口语化、去 AI 味。完整规则见 `docs/agents/voice.md`。
- **代码注释**：简洁，匹配周围代码风格，不单独发挥。

## 术语来源（单一事实源）

查询任何事实前，先认准下面这张表，不要从记忆里答。

| 范畴 | 真相源 |
|------|--------|
| 领域词汇与业务规则 | `CONTEXT.md` |
| 数据库表结构与种子数据 | `db/seed/init_db.sql`（`CREATE TABLE` 段 + `INSERT` 段） |
| API 契约 | `backend/routes/*.py` + `backend/models.py` |
| 前端页面与交互 | `frontend/*.html` + `frontend/js/*.js` |
| 项目状态与交接 | `docs/` 下项目级文档（凝练后的汇总文件） |

## 命名规则

- **后端**：路由 `backend/routes/<resource>.py`，Blueprint 名与资源一致；URL 前缀 `/api/<resource>`（复数）；表名小写复数、下划线分隔；字段 `snake_case`；主键 `id`，外键 `<table>_id`。
- **前端**：页面 `frontend/<page>.html`；页面逻辑 `frontend/js/<page>.js`；API 封装 `frontend/js/api.js`（`API_BASE_URL = http://localhost:5001/api`）；全局样式 `frontend/assets/styles.css`。
- **数据**：种子 SQL 统一放 `db/seed/`，改动后必须同步更新，不得手改本机 MySQL 数据文件。

命名细节与 API 响应格式见 `AGENTS.md` § 文件命名规范。
