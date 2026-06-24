# Week 1 PPT 要点

## 第 1 页：Week 1 概览 — 从 0 到 1 的起步

- 大家好，Week 1 我们的目标是「搭骨架、建数据、跑通认证」
- 5 天时间，完成了从项目初始化到用户登录、资源浏览的完整链路
- 具体四件事：项目骨架搭建、数据库设计、用户模块、资源模块
- 产出 11 次代码提交、32 个新增文件、12 张数据库表、23 条种子资源
- 为 Week 2 的题库、计划、统计、推荐四大业务模块打下了坚实基础

## 第 2 页：技术选型与架构设计

- 选型原则：简单、可演示、不引入新框架
- 后端 Flask：Python 课程主要语言，轻量、路由清晰、文档丰富
- 数据库 MySQL 8.0：支持事务和外键，演示数据 SQL 脚本一键导入，换机方便
- 前端原生 HTML/CSS/JS：不引入 Vue/React，降低答辩环境搭建成本
- 前后端分离架构：后端 5001 提供 REST API，前端 8080 静态服务，fetch + CORS 通信
- API 统一响应格式：`{ success, data, message }`，前端处理逻辑一致

## 第 3 页：数据库设计 — 12 张核心表

- Week 1 重头戏：一次性定义 12 张表，覆盖全部 7 个模块
- 核心表：users、subjects、resources、questions、answers、plans、plan_items、progress、weak_points、recommendations、comments、goals
- 表间外键关联：answers 关联 users 和 questions，plan_items 关联 plans 和 subjects
- 11 个索引覆盖高频查询：用户名、用户 ID、科目 ID、资源 ID、答题时间等
- 种子数据：7 科目、23 资源、4 演示账号，执行 `python init_db.py` 一键重建

## 第 4 页：用户模块 — 注册登录与 Session 认证

- 4 个 API：注册、登录、登出、获取当前用户
- 密码安全：werkzeug scrypt 哈希，不存明文
- 登录态：Flask Session + Cookie，浏览器自动携带 session_id
- 演示友好：登录页预填 root/123456，答辩时快速进入系统
- 权限控制：`login_required` 校验登录态，`admin_required` 校验管理员角色
- 管理员专属：资源上传、批量删除等操作需要 admin 权限

## 第 5 页：资源模块 — 23 条备考资源入库

- 资源分 5 类：考试大纲、历年真题、模拟题、备考资料、政策公告
- 共 23 条资源，每条关联科目，如「2025 年国考行测真题」关联「行政职业能力测验」
- 前端支持：类型标签切换、科目筛选、关键词搜索
- 管理功能：管理员可上传新资源、批量删除
- 资源详情：展示内容摘要和关联题目数量，点击可进入练习
