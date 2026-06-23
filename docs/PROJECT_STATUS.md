# Project Status — 公务员考试学习跟踪系统

## 项目信息

- **项目名称**：公务员考试学习跟踪系统
- **技术栈**：Python Flask + SQLite + 原生 HTML/CSS/JS
- **仓库地址**：https://github.com/Aafff623/civil-service-exam-tracker
- **创建日期**：2026-06-23

## 已完成

- [x] 项目初始化、PRD、GitHub 仓库、工程规范
- [x] 用户与账户模块
- [x] 考试资源管理模块
- [x] GPT 前端设计资产集成
- [x] 题库与练习模块
- [x] 智能学习计划生成模块
- [x] 学习进度跟踪模块
- [x] 个性化推荐模块
- [x] 题目答疑留言 API + Dashboard 数据接入
- [x] 全站主要页面 API 集成与 Playwright 冒烟测试

## 进行中

- [ ] 集中 Review 与 Bug 修复（由用户主导）

## 可选后续优化

1. Dashboard 考试时间线接入资源 API
2. AI 答疑接入真实 LLM
3. emoji 图标替换 SVG
4. 扩充种子题目数据
5. 同步更新 `docs/ROADMAP.md` 勾选状态

## 关键决策

| 决策项 | 选择 | 说明 |
|---|---|---|
| Issue tracker | Local markdown | 使用 `.scratch/<feature>/` |
| Backend port | 5001 | 避免端口冲突 |
| Frontend server | 8080 | 本地静态服务 |
| 推荐算法 | 规则驱动 | 弱项正确率 + 科目权重，非 ML |
| Agent 规范 | AGENTS.md | 根目录协作与路由地图 |

## 备注

- 每次交接更新 `docs/HANDOFF.md`
- 后端 API 地图见 `AGENTS.md`