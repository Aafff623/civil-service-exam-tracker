<p align="center">
  <h1 align="center">公务员考试学习跟踪系统</h1>
  <p align="center"><strong>面向课程设计的 Flask + MySQL 全栈演示项目</strong></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/课程设计-已完成-brightgreen?style=for-the-badge" alt="课程设计状态">
  <img src="https://img.shields.io/badge/后端-Flask%203.0-blue?style=for-the-badge" alt="后端">
  <img src="https://img.shields.io/badge/数据库-MySQL%208.0-blue?style=for-the-badge" alt="数据库">
  <img src="https://img.shields.io/badge/前端-原生%20HTML%2FCSS%2FJS-orange?style=for-the-badge" alt="前端">
</p>

<p align="center">
  <a href="#-highlights-亮点聚焦">亮点</a> ·
  <a href="#-background-项目背景">背景</a> ·
  <a href="#-progress-项目进度">进度</a> ·
  <a href="#-workflow-工作流">工作流</a> ·
  <a href="#-repo-structure-仓库结构">结构</a> ·
  <a href="#-link-关键链接">链接</a>
</p>

---

## ✨ Highlights (亮点聚焦)

- **七大核心模块**：用户账户、资源管理、智能计划、题库练习、进度统计、弱项推荐、解析答疑。
- **完整数据闭环**：从目标设定 → 计划生成 → 练习答题 → 弱项识别 → 个性化推荐全部走通。
- **200 道种子题**：覆盖单选 / 多选 / 判断，按科目与资料来源可筛选演示。
- **前后端分离**：Flask REST API + 原生 HTML/CSS/JS，结构清晰，适合课程设计答辩。
- **开箱即跑**：一条 README 即可在答辩机完成 clone → 配置 → 启动 → 验收。

## 🌱 Background (项目背景)

公务员考试内容庞杂、备考周期长，大学生自学时普遍面临：缺乏系统计划、进度难以量化、薄弱环节难以识别。本项目作为数据结构课程设计，开发了一套轻量级学习跟踪系统，帮助考生建立科学的备考节奏。

技术选型以「简单、可演示、易维护」为原则：

- 后端：**Python Flask**（RESTful API，Session 认证）
- 数据库：**MySQL 8.0+**（演示数据通过 `init_db.sql` 一键导入）
- 前端：**原生 HTML/CSS/JS**（无框架，降低答辩环境搭建成本）

## 📊 Progress (项目进度)

| 模块 | 状态 | 说明 |
|------|:----:|------|
| 用户与账户 | ✅ | 注册、登录、个人信息、学习目标 |
| 考试资源管理 | ✅ | 23 条资源，支持分类筛选与详情 |
| 智能学习计划 | ✅ | 按备考周期与弱项生成每日任务 |
| 题库与练习 | ✅ | 200 题，单选/多选/判断，资源关联 |
| 学习进度统计 | ✅ | 完成率、正确率、图表可视化 |
| 个性化推荐 | ✅ | 基于弱项推荐资源与同类题目 |
| 题目解析与答疑 | ✅ | 解析展示 + 留言（规则回复） |

剩余待办：答辩机换机实测、集中 Review 与可选小优化。

## ⚙️ Workflow (工作流)

### 前置环境准备

| 组件 | 版本建议 | 备注 |
|------|----------|------|
| Python | 3.10+ | 用于运行 Flask 后端 |
| MySQL | 8.0+ | 本地或远程均可 |
| Git | 任意近期版本 | 拉取代码与同步更新 |
| 现代浏览器 | Chrome / Edge / Firefox | 访问前端页面 |

> 本项目依赖均为纯 Python 包（Flask、PyMySQL 等），安装时通常**不需要** Microsoft C++ Build Tools。若在某些精简版 Windows 上安装 `Werkzeug` 或 `PyMySQL` 的依赖时提示缺少编译器，再按需安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)。

### 1. 获取代码

```powershell
git clone https://github.com/Aafff623/civil-service-exam-tracker.git
cd civil-service-exam-tracker
```

### 2. 配置 MySQL

1. 启动 MySQL 服务。
2. 复制环境变量模板并填写密码：

```powershell
copy backend\.env.example backend\.env
```

编辑 `backend/.env`：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=你的MySQL密码
MYSQL_DATABASE=civil_service_exam
SECRET_KEY=dev-secret-key-change-in-production
```

### 3. 安装依赖并初始化数据库

```powershell
cd backend
python -m pip install -r requirements.txt
python init_db.py
```

`init_db.py` 会**删表重建**并导入：

- 7 个科目、23 条备考资源
- **200 道**题目（单选 / 多选 / 判断）
- 演示账号、学习计划、答题记录等

### 4. 开机运行指南

需要同时开两个终端：

**终端 A — 后端（端口 5001）**

```powershell
cd backend
python app.py
```

**终端 B — 前端静态站（端口 8080）**

```powershell
cd frontend
python -m http.server 8080
```

打开浏览器访问：

| 地址 | 说明 |
|------|------|
| http://localhost:8080/login.html | 登录页 |
| http://localhost:5001/api/health | 后端健康检查 |

**演示账号**（密码均为 `123456`）：

| 用户名 | 角色 | 说明 |
|--------|------|------|
| root | admin | 数据最全，适合答辩演示 |
| testuser1 | user | 有计划与答题记录 |
| testuser2 | user | 接近新用户空状态 |
| testuser3 | user | 少量答题，测弱项推荐 |

### 5. 答辩机换机实测检查清单

在另一台电脑上按以下顺序验证：

- [ ] 安装 Python 3.10+、MySQL 8.0+、Git
- [ ] `git clone` 本项目
- [ ] 复制 `backend/.env.example` → `backend/.env` 并填写 MySQL 密码
- [ ] `cd backend && python -m pip install -r requirements.txt`
- [ ] `cd backend && python init_db.py` 成功，输出数据库名与 SQL 路径
- [ ] 启动后端 `python app.py`，确认监听 5001
- [ ] 启动前端 `python -m http.server 8080`，确认监听 8080
- [ ] 访问 `http://localhost:5001/api/health` 返回成功
- [ ] 访问 `http://localhost:8080/login.html` 能打开登录页
- [ ] 用 `root / 123456` 登录，按「考试与资源 → 资源详情 → 开始练习 → 学习统计 → 学习推荐」路径验收

### 6. 日常维护规范

| 操作 | 命令 | 说明 |
|------|------|------|
| 重置数据库 | `cd backend && python init_db.py` | 会清空数据并重新导入种子 |
| 审计题库分布 | `cd backend && python _audit_questions.py` | 查看各科目题型数量 |
| 从 HTML 重新生成题目 SQL | `cd backend && python seed_questions_from_html.py && python patch_init_db.py` | 更新 `frontend/assets/init_db.sql` |
| 改题后同步到答辩机 | `git add frontend/assets/init_db.sql && git commit && git push` | 答辩机 `git pull` 后重新 `init_db.py` |
| 依赖更新 | `cd backend && python -m pip install -r requirements.txt` | 当 `requirements.txt` 变更时 |

**重要提醒**：

- 演示数据在 Git 中的 `frontend/assets/init_db.sql`，**不要**拷贝本机 MySQL 数据文件到另一台电脑。
- 后端数据库文件 `backend/database.db` 已在 `.gitignore` 中，不会提交。
- 修改表结构后必须重新执行 `init_db.py`。

### 常见问题

**Q：换机后题库为空？**  
A：未执行 `python init_db.py`，或 `.env` 连错库。确认登录后 `GET /api/questions` 是否有数据。

**Q：前端能开但接口 401 / 连不上？**  
A：确认后端在 5001 运行；`frontend/js/api.js` 中 `API_BASE_URL` 为 `http://localhost:5001/api`。

**Q：改题目后另一台机没更新？**  
A：需提交并推送 `frontend/assets/init_db.sql`，另一台 `git pull` 后重新 `init_db.py`。

**Q：需要 SQLite 吗？**  
A：不需要。当前栈为 **MySQL + PyMySQL**。

## 📂 Repo-Structure (仓库结构)

```
civil-service-exam-tracker/
├── backend/                    # Flask API（端口 5001）
│   ├── app.py
│   ├── routes/                 # 各模块 Blueprint
│   ├── init_db.py              # 数据库初始化
│   ├── models.py
│   └── requirements.txt
├── frontend/                   # 静态页面（端口 8080）
│   ├── *.html                  # 页面
│   ├── js/                     # 页面逻辑与 API 封装
│   └── assets/init_db.sql      # 种子 SQL（唯一数据源）
├── docs/                       # HANDOFF、PROJECT_STATUS、ROADMAP
├── PRD-civil-service-exam-tracker.md
├── CONTEXT.md                  # 领域词汇与业务规则
├── CLAUDE.md                   # 项目协作规范
├── AGENTS.md                   # Agent 协作与 API 路由地图
└── README.md                   # 本文档
```

## 🔗 Link (关键链接)

- 项目仓库：https://github.com/Aafff623/civil-service-exam-tracker
- 后端健康检查：http://localhost:5001/api/health
- 前端登录页：http://localhost:8080/login.html

## 🔒 Privacy (隐私提醒)

本项目为课程设计演示系统，所有数据默认存储在本地 MySQL。`users` 表中的密码使用 scrypt 哈希，不保存明文。请勿将演示环境直接用于生产场景。

---

> 课程设计进入收尾阶段：功能开发已完成，剩余工作为答辩机实测、集中 Review 与可选小优化。
