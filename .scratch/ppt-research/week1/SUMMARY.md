# Week 1 调研摘要

## 本周目标

搭建项目骨架，完成数据库设计，实现用户账户与考试资源管理模块，为后续核心业务模块奠定技术与数据基础。

## 实际完成内容

- Day 1：项目初始化 — Git 仓库、GitHub 远端、PRD、ROADMAP、PROJECT_STATUS、HANDOFF、CONTEXT.md
- Day 2：项目骨架 — `backend/` Flask 目录结构、`frontend/` 目录结构、`.gitignore`、`requirements.txt`
- Day 3：数据库设计 — 12 张核心表、`init_db.sql`、`init_db.py` 初始化脚本、基础种子数据
- Day 4：用户与账户 — 注册/登录/登出 API、前端登录注册页面、Session 登录态管理
- Day 5：考试资源管理 — 资源列表/详情 API、资源库页面、分类筛选、GPT 设计资产集成

## 关键产出

- 前后端分离架构搭建完成（Flask 5001 + 静态服务 8080）
- MySQL 数据库 12 张表 + 11 个索引确定
- 用户认证与会话机制跑通（Session + scrypt 哈希）
- 23 条备考资源入库并可浏览（5 大类型、7 科目）
- 前端设计系统（MASTER.md）与初始页面风格确定

## 核心数据

- 代码提交：11 次（Week 1 核心 commit）
- 新增/修改文件：32 个文件，+1435 行
- 数据库表：12 张
- 数据库索引：11 个
- 种子资源：23 条
- 种子科目：7 个
- 演示账号：4 个
- API Blueprint：2 个（auth + resources）
- 后端路由：6 个

## 亮点与难点

- 亮点：技术选型简洁（Flask + MySQL + 原生前端），数据库设计一步到位预留全链路外键，命名规范前置统一，Session 认证轻量可靠
- 难点/解决方案：PRD 初稿写 SQLite 后续迁移至 MySQL，通过 `init_db.py` 一键重建；前端风格不统一引入 GPT 设计资产建立 Token 规范；资源分类需要可扩展使用 CHECK 约束 + 外键关联

## PPT 建议页数与标题

1. Week 1 概览 — 从 0 到 1 的起步
2. 技术选型与架构设计
3. 数据库设计 — 12 张核心表
4. 用户模块 — 注册登录与 Session 认证
5. 资源模块 — 23 条备考资源入库
