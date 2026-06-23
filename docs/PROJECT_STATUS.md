# Project Status — 公务员考试学习跟踪系统

## 项目信息

- **项目名称**：公务员考试学习跟踪系统
- **技术栈**：Python Flask + SQLite + 原生 HTML/CSS/JS
- **仓库地址**：https://github.com/Aafff623/civil-service-exam-tracker
- **创建日期**：2026-06-23

## 已完成

- [x] 创建项目文件夹 `civil-service-exam-tracker`
- [x] 编写 PRD：`PRD-civil-service-exam-tracker.md`
- [x] 安装项目级 skills：ui-ux-pro-max、ppt-master、matt-pocock
- [x] 运行 `/setup-matt-pocock-skills`
- [x] 创建 `CLAUDE.md`、`docs/agents/`
- [x] 编写 `CONTEXT.md`
- [x] 初始化 Git 仓库
- [x] 创建 GitHub private 仓库并推送初始提交
- [x] 搭建 Flask + 前端项目骨架（含健康检查 API）
- [x] 配置 `.gitignore`
- [x] 设计数据库表结构并写 `backend/init_db.sql`

## 进行中

- [ ] 用户与账户模块

## 下一步

1. 实现用户与账户模块（注册、登录、登出、个人信息）
2. 考试资源管理模块
3. 题库与练习模块
4. 智能学习计划生成模块
5. 学习进度跟踪模块
6. 个性化推荐模块
7. 题目解析与答疑模块

## 关键决策

| 决策项 | 选择 | 说明 |
|---|---|---|
| Issue tracker | Local markdown | 使用 `.scratch/<feature>/` |
| Triage labels | 默认 | `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` |
| Domain docs | Single-context | 根目录 `CONTEXT.md` + `docs/adr/` |
| Git remote | GitHub private | https://github.com/Aafff623/civil-service-exam-tracker |

## 备注

- 路线图显示为三周，实际可压缩执行。
- 每完成一个模块进行一次 review。
- 每次交接更新 `docs/HANDOFF.md`。
