# CLAUDE.md — 公务员考试学习跟踪系统

> **Output Style**：`humanizer-output-style` skill — 统一语气与去 AI 味。详见 `skills/humanizer-output-style/SKILL.md` 与 `docs/agents/voice.md`。

## Project overview

这是一个面向大学大一、大二学生的**公务员考试学习跟踪系统**课程设计项目。

- **技术栈**：Python Flask（后端）+ MySQL 8.0+（数据库）+ 原生 HTML/CSS/JS（前端）
- **架构**：前后端分离，RESTful API，Session/Cookie 认证
- **复杂度**：简单、可演示、不追求商业化
- **状态**：功能开发已完成，进入答辩机实测与收尾 Review 阶段

## Agent skills

本项目使用 Matt Pocock 风格的工作流规范：

- **Issue tracker**：本地 markdown 文件，位于 `.scratch/<feature-slug>/`，见 `docs/agents/issue-tracker.md`
- **Triage labels**：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`
- **Domain docs**：`CONTEXT.md` + `docs/adr/`
- **Module workflow**：实现功能模块时遵循 before/during/after 流程，见 `docs/agents/module-development-workflow.md`

## Core modules

1. 用户与账户
2. 考试资源管理
3. 智能学习计划生成
4. 题库与练习
5. 学习进度跟踪
6. 个性化推荐
7. 题目解析与答疑

详细需求见 `PRD-civil-service-exam-tracker.md`。

## Quick start

### 无数据库快速演示（推荐答辩/换机）

```powershell
# Windows 双击 quickstart-mock.bat 即可自动检测 Python、启动前端并打开浏览器
# 或手动：
cd frontend
python -m http.server 8080
```

访问 http://localhost:8080/login.html?mock=1，演示账号 `root / 123456`。  
无需安装/启动 MySQL 与 Flask，前端 Mock fallback 覆盖全部页面与核心交互。

### 完整前后端启动

```powershell
cd backend
copy .env.example .env   # 填写 MySQL 密码
python -m pip install -r requirements.txt
python init_db.py        # 导入 200 道种子题 + 23 条资源
python app.py            # 端口 5001

cd ../frontend
python -m http.server 8080
```

访问 http://localhost:8080/login.html，演示账号 `root / 123456`。

完整环境准备、开机运行、换机实测与维护规范见 `README.md`。

## Current status

- 7 个核心模块全部实现并联调通过
- 题库已扩容至 200 题（单选/多选/判断）
- 23 条备考资源已入库，支持与题目关联
- 换机部署说明已写入 `README.md`
- 前端 Mock fallback 完成：无 MySQL/Flask 时可独立演示全部页面与核心交互
- Windows 一键 Mock 启动脚本 `quickstart-mock.bat` 已添加
- 测试中发现并修复：mock 多选题筛选为空、判断题选项显示异常
- 剩余工作：后端 API 冒烟测试、答辩机换机实测、集中 Review、可选小优化

## Notes for agents

- 不要引入新框架或重写架构，只做收尾级的小修小补
- 所有数据变更必须同步更新 `db/seed/init_db.sql`
- 重大决策变更写入 `docs/adr/`；项目状态以 `README.md` 路线图为准（无独立交接文档）
- 后端端口 5001，前端端口 8080，不要改动
