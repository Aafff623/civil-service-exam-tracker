# Handoff Document — 公务员考试学习跟踪系统

> **用途**：记录当前会话的上下文、已完成工作、待办事项和下一步动作，方便后续继续或交接给其他 agent。

## 最近一次更新

- **时间**：2026-06-23
- **会话动作**：实现智能学习计划生成模块（后端 API + plan.html 接入）
- **执行者**：Grok Agent

## 当前上下文

- 用户与账户、考试资源、题库与练习、学习计划模块均已完成。
- `plan.html` 已接入后端，支持生成计划、查看本周安排、标记任务完成。
- 下一步优先：学习进度统计（`statistics.html`）。

## 已完成（本次会话）

### 后端学习计划 API

- `backend/routes/plans.py`：
  - `GET/POST /api/plans/goal` — 获取/保存学习目标
  - `GET /api/plans/` — 获取当前计划摘要（阶段、任务数）
  - `POST /api/plans/generate` — 根据目标生成计划（覆盖旧计划）
  - `GET /api/plans/items` — 查询计划项（支持 `date` / `from`+`to`）
  - `PATCH /api/plans/items/<id>` — 标记完成/取消，同步 `progress` 表
  - `GET /api/plans/subjects` — 科目权重/难易度表
- 已在 `app.py` 注册 `plans` blueprint

### 前端学习计划页

- `frontend/js/api.js`：新增 plan 相关 API 方法
- `frontend/js/plan.js`（新建）：表单、生成计划、结果预览、本周安排、任务完成切换
- `frontend/plan.html`：接入 `api.js` + `app.js` + `plan.js`，添加登录守卫
- `frontend/assets/styles.css`：补充 `.hidden` 工具类

### 验证结果

- 60 天计划生成 305 个任务项 ✓
- 科目表返回 6 个叶子科目（含申论）✓
- 标记任务完成写入 `progress` 表 ✓

## 待办事项（按优先级）

1. **学习进度统计** — `routes/progress.py` + `statistics.html`
2. **个性化推荐** — `routes/recommendations.py` + `recommendations.html`
3. **Dashboard 今日任务** — 从 `/api/plans/items?date=today` 动态加载
4. **题目答疑** — `comments` API；AI 答疑仍为模拟

## 已知问题 / 注意事项

- `recommendations.html`、`statistics.html` 仍为静态，未挂登录守卫
- 重新生成计划会删除旧计划及全部任务项
- 雷达图仍为静态展示，未接入弱项实时数据

## 下一步动作

由下一个 Agent 继续：
1. 实现 `/api/progress` 统计 API
2. 接入 `statistics.html` 展示学习进度与正确率

## 运行方式

1. `cd backend && python init_db.py`（可选，重置数据库）
2. `cd backend && python app.py`（端口 5001）
3. `cd frontend && python -m http.server 8080`
4. 访问 http://localhost:8080/plan.html

## 提交记录

- `feat(questions): implement question bank API and practice page`
- 学习计划模块（待提交）：`feat(plans): implement study plan generation and plan page`