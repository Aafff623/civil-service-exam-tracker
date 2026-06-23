# Handoff Document — 公务员考试学习跟踪系统

> **用途**：记录当前会话的上下文、已完成工作、待办事项和下一步动作，方便后续继续或交接给其他 agent。

## 最近一次更新

- **时间**：2026-06-23
- **会话动作**：完成 Git 与 GitHub 远端同步，创建项目 roadmap 和状态文档
- **执行者**：Claude Fable 5

## 当前上下文

- 项目已初始化并推送到 GitHub private 仓库。
- Matt Pocock 工程技能配置完成（issue tracker、labels、domain docs）。
- 三个项目级 skill 已安装：ui-ux-pro-max、ppt-master、matt-pocock。
- PRD 已完成，需求拆分为 7 个功能模块。

## 已完成（本次会话）

- 创建 GitHub private 仓库 `civil-service-exam-tracker`
- 本地 `git init` 并推送初始提交
- 创建 `docs/ROADMAP.md`
- 创建 `docs/PROJECT_STATUS.md`
- 创建本文件 `docs/HANDOFF.md`

## 待办事项（按优先级）

1. **编写 `CONTEXT.md`**
   - 整理领域术语表
   - 明确核心概念定义

2. **搭建项目骨架**
   - `backend/` Flask 目录
   - `frontend/` 目录
   - `requirements.txt`
   - 健康检查 API

3. **设计数据库**
   - 写 `backend/init_db.sql`
   - 确定表结构和关系

4. **按模块实现功能**
   - 用户与账户
   - 考试资源管理
   - 题库与练习
   - 智能学习计划生成
   - 学习进度跟踪
   - 个性化推荐
   - 题目解析与答疑

## 下一步动作

开始编写 `CONTEXT.md`。

## 重要文件路径

- PRD：`PRD-civil-service-exam-tracker.md`
- 项目配置：`CLAUDE.md`
- 状态跟踪：`docs/PROJECT_STATUS.md`
- 路线图：`docs/ROADMAP.md`
- 远端仓库：https://github.com/Aafff623/civil-service-exam-tracker

## 注意事项

- 每次会话结束后更新本文件。
- 每完成一个模块更新 `docs/PROJECT_STATUS.md` 并做一次 review。
- 提交信息遵循 Conventional Commits 格式。
