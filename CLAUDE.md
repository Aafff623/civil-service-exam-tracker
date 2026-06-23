# CLAUDE.md — 公务员考试学习跟踪系统

## Project overview

这是一个面向大学大一、大二学生的**公务员考试学习跟踪系统**课程设计项目。

- **技术栈**：Python Flask（后端）+ SQLite（数据库）+ 原生 HTML/CSS/JS（前端）
- **架构**：前后端分离，RESTful API
- **复杂度**：简单、可演示、不追求商业化

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

We use the five canonical Matt Pocock labels unchanged: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo: `CONTEXT.md` at the repo root plus `docs/adr/` for architectural decisions. See `docs/agents/domain.md`.

### Module workflow

When implementing a feature module, follow the standard before/during/after workflow. See `docs/agents/module-development-workflow.md`.

## Core modules

1. 用户与账户
2. 考试资源管理
3. 智能学习计划生成
4. 题库与练习
5. 学习进度跟踪
6. 个性化推荐
7. 题目解析与答疑

详细需求见 `PRD-civil-service-exam-tracker.md`。
