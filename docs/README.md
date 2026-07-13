# 文档索引 — 公务员考试学习跟踪系统

> `docs/` 的总入口。按用途分类，告诉你「想做某件事先看哪份」。
> 根目录另有 `README.md`（项目首页 + 快速开始）、`PRD-civil-service-exam-tracker.md`（需求）、`CONTEXT.md`（领域词汇）、`LANGUAGES.md`（语言与命名）、`AGENTS.md`（API 路由地图）、`CLAUDE.md`（协作规范）。

---

## 决策与术语

| 文档 | 什么时候看 |
|------|-----------|
| [adr/0001-key-decisions.md](adr/0001-key-decisions.md) | 关键技术与流程决策：为什么用 MySQL / 规则推荐 / 原生前端 / mock |
| [glossary/terms.md](glossary/terms.md) | 术语速查（中英对照，详情见根 `CONTEXT.md`）|

## 协作规范

| 文档 | 什么时候看 |
|------|-----------|
| [agents/](agents/) | Agent 工作流：domain · issue-tracker · triage-labels · module-development-workflow · workflow · deliver · archive · voice |
| [adr/](adr/) | 架构决策记录，目前为空；非平凡决策在此建档 |

## 答辩材料

| 内容 | 路径 |
|------|------|
| 成品 PPT | [`../assets/theme/ppt/`](../assets/theme/ppt/)：Week 1/2/3 阶段汇报 + 最终答辩稿 + `screenshots/` 8 张系统截图 |

## 术语与知识（骨架，按需填充）

| 目录 | 用途 |
|------|------|
| [glossary/](glossary/) | 术语速查（`terms.md`）|
| [commit-history/](commit-history/) | commit 攒批说明（骨架）|
| [output/](output/) | 业务 theme 产物骨架：`report/` · `prd/` · `handoff/` |

## 历史归档（仅供参考，不再维护）

| 文档 | 说明 |
|------|------|
| [archive/ppt-production.md](archive/ppt-production.md) | PPT 制作存档（合并自原 3 份过程文档） |
| [archive/frontend-design-review.md](archive/frontend-design-review.md) | 前端设计评审（写于 5 页阶段，已部分过时） |
