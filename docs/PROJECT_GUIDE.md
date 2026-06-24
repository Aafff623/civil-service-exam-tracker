# 公务员考试学习跟踪系统 — 项目使用指南

> 本指南面向需要在答辩机或新环境部署、运行和维护本系统的用户与开发者。

## 一、项目概述

本项目是一个面向大学大一、大二学生的**公务员考试学习跟踪系统**课程设计。系统采用前后端分离架构，帮助考生管理备考资源、生成学习计划、记录答题历史、识别薄弱环节并获取个性化推荐。

### 1.1 核心功能

| 模块 | 功能说明 |
|------|----------|
| 用户与账户 | 注册、登录、个人信息管理、学习目标设置 |
| 考试资源管理 | 浏览考试大纲、历年真题、模拟题、学习资料、公告 |
| 智能学习计划 | 根据备考周期与弱项生成每日学习任务 |
| 题库与练习 | 单选 / 多选 / 判断答题，支持科目与资料来源筛选 |
| 学习进度统计 | 完成率、正确率、学习时长可视化 |
| 个性化推荐 | 基于弱项推荐相关资源与同类练习题 |
| 题目解析与答疑 | 每题提供解析与技巧，支持留言提问 |

### 1.2 技术架构

```
┌─────────────────┐      HTTP/REST       ┌─────────────────┐      SQL       ┌─────────────┐
│   前端浏览器     │  ◄─────────────────►  │  Flask 后端     │  ◄──────────►  │  MySQL 8.0+ │
│  HTML/CSS/JS    │    (端口 8080)        │  Python 3.10+   │   (端口 5001)   │             │
└─────────────────┘                       └─────────────────┘                └─────────────┘
```

- **前端**：原生 HTML5 + CSS3 + JavaScript，通过 `fetch` 调用后端 API
- **后端**：Flask 3.0，RESTful API，Session/Cookie 认证
- **数据库**：MySQL 8.0+，演示数据通过 `init_db.sql` 导入
- **通信**：JSON 格式，统一响应 `{ success, data, message }`

## 二、环境准备

### 2.1 必需软件

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| Python | 3.10 或更高 | 运行 Flask 后端 |
| MySQL | 8.0 或更高 | 数据持久化 |
| Git | 任意近期版本 | 代码拉取与同步 |
| 现代浏览器 | Chrome / Edge / Firefox | 访问前端页面 |

### 2.2 验证安装

打开 PowerShell，依次执行：

```powershell
python --version       # 应显示 3.10+
mysql --version        # 应显示 8.0+
git --version          # 确认 git 已安装
```

### 2.3 MySQL 服务启动

**Windows 方式一：服务管理器**

1. 按 `Win + R`，输入 `services.msc`
2. 找到 **MySQL80**（或类似名称）服务
3. 右键 → 启动

**Windows 方式二：命令行**

```powershell
net start MySQL80
```

**验证 MySQL 可连接**

```powershell
mysql -u root -p -e "SELECT VERSION();"
```

输入密码后应显示 MySQL 版本号。

### 2.4 可选：Microsoft C++ Build Tools

本项目依赖（Flask、Werkzeug、PyMySQL）均为纯 Python 包，Windows 上通常直接安装即可。只有在以下情况才需要 Build Tools：

- 使用精简版 Windows 或自定义 Python 发行版
- 安装依赖时报错 `Microsoft Visual C++ 14.0 is required`

如需安装，访问：

```text
https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

选择「使用 C++ 的桌面开发」工作负载，安装后即可。

## 三、项目部署

### 3.1 获取代码

> 若是**压缩包换机**（不是 git clone），跳过本节、改看 `docs/DEPLOY_FROM_ZIP.md`，再回到 3.2 继续。

```powershell
git clone https://github.com/Aafff623/civil-service-exam-tracker.git
cd civil-service-exam-tracker
```

### 3.2 配置数据库连接

1. 复制环境模板：

```powershell
copy backend\.env.example backend\.env
```

2. 编辑 `backend/.env`，填写实际 MySQL 配置：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=你的MySQL密码
MYSQL_DATABASE=civil_service_exam
SECRET_KEY=dev-secret-key-change-in-production
```

**参数说明**：

- `MYSQL_HOST`：数据库地址，本机用 `localhost`，远程服务器用 IP
- `MYSQL_PORT`：默认 3306
- `MYSQL_USER`：MySQL 用户名，通常为 `root`
- `MYSQL_PASSWORD`：对应密码
- `MYSQL_DATABASE`：数据库名，系统会自动创建
- `SECRET_KEY`：用于 Session 签名，生产环境应改为随机长字符串

### 3.3 安装 Python 依赖

```powershell
cd backend
python -m pip install -r requirements.txt
```

依赖清单：

- Flask==3.0.3
- Werkzeug==3.0.3
- python-dotenv==1.0.1
- Flask-Cors==4.0.1
- PyMySQL==1.1.1

### 3.4 初始化数据库

```powershell
python init_db.py
```

成功后会输出：

```text
Initialized MySQL database: civil_service_exam on localhost:3306
SQL source: ...\frontend\assets\init_db.sql
```

**注意**：`init_db.py` 会**删除并重建**数据库，请确保 `.env` 配置正确，避免误删其他数据库。

导入的数据包括：

- 7 个考试科目（行测五大模块 + 申论）
- 23 条备考资源
- 200 道题目（单选 152 / 判断 34 / 多选 14）
- 4 个演示账号及对应的计划、答题记录

## 四、启动与运行

### 4.1 双终端启动

需要同时运行两个服务：

**终端 A — 后端服务（端口 5001）**

```powershell
cd backend
python app.py
```

预期输出：

```text
 * Running on http://127.0.0.1:5001
 * Running on http://10.xxx.xxx.xxx:5001
```

**终端 B — 前端静态服务（端口 8080）**

```powershell
cd frontend
python -m http.server 8080
```

### 4.2 访问系统

打开浏览器，访问：

```text
http://localhost:8080/login.html
```

演示账号：

| 用户名 | 密码 | 角色 | 用途 |
|--------|------|------|------|
| root | 123456 | admin | 数据最全，答辩演示 |
| testuser1 | 123456 | user | 有计划与答题记录 |
| testuser2 | 123456 | user | 新用户空状态 |
| testuser3 | 123456 | user | 少量答题，测弱项推荐 |

### 4.3 验证服务状态

```powershell
curl http://localhost:5001/api/health
```

应返回：

```json
{
  "success": true,
  "data": { "status": "ok" },
  "message": "Service is running"
}
```

## 五、日常使用与维护

### 5.1 推荐验收路径

按以下顺序验证系统功能完整性：

1. 登录页使用 `root / 123456` 登录
2. 首页 Dashboard 查看今日任务与进度概览
3. 「考试与资源」浏览资源列表，进入资源详情
4. 点击「开始练习本题库」进入题库练习
5. 在题库中切换科目 / 资料来源 / 题型，完成答题
6. 「学习统计」查看正确率与图表
7. 「学习推荐」查看基于弱项的推荐
8. 「学习计划」查看生成的每日任务

### 5.2 数据库重置

当修改表结构或需要恢复初始演示数据时：

```powershell
cd backend
python init_db.py
```

### 5.3 题库内容更新

如果从 HTML 资源重新生成题目 SQL：

```powershell
cd backend
python seed_questions_from_html.py
python patch_init_db.py
```

这会更新 `frontend/assets/init_db.sql` 中的 `INSERT INTO questions` 部分。

### 5.4 同步更新到答辩机

改题后必须执行：

```powershell
git add frontend/assets/init_db.sql
git commit -m "data: update question bank"
git push
```

答辩机执行：

```powershell
git pull
cd backend
python init_db.py
```

### 5.5 依赖更新

当 `requirements.txt` 变更后：

```powershell
cd backend
python -m pip install -r requirements.txt
```

## 六、故障排查

### 6.1 登录页显示 "Failed to fetch"

**原因**：前端无法连接到后端。

**排查步骤**：

1. 确认后端终端已启动且监听 5001
2. 确认访问的是 `http://localhost:8080/login.html`，不是 `file://`
3. 检查 `frontend/js/api.js` 中的 `API_BASE_URL` 是否为 `http://localhost:5001/api`
4. 检查防火墙是否拦截了 5001 端口

### 6.2 换机后题库为空

**原因**：未执行 `init_db.py` 或 `.env` 连错库。

**排查步骤**：

1. 确认 `backend/.env` 中 MySQL 密码正确
2. 确认已执行 `python init_db.py`
3. 登录后调用 `GET /api/questions` 检查是否有数据

### 6.3 前端能开但接口 401

**原因**：未登录或 Session 失效。

**排查步骤**：

1. 确认已登录
2. 确认后端在 5001 运行
3. 清除浏览器 Cookie 后重新登录

### 6.4 依赖安装报错

如果安装 `requirements.txt` 时提示编译错误，尝试：

```powershell
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

如仍失败，安装 Microsoft C++ Build Tools 后再试。

## 七、数据安全与备份

### 7.1 数据位置

- 演示数据源码：`frontend/assets/init_db.sql`
- 运行时数据：MySQL 数据库 `civil_service_exam`
- 本地数据库文件 `backend/database.db` 未使用，已在 `.gitignore` 中

### 7.2 备份建议

答辩前建议备份：

```powershell
mysqldump -u root -p civil_service_exam > backup.sql
```

恢复：

```powershell
mysql -u root -p civil_service_exam < backup.sql
```

### 7.3 密码安全

- 用户密码使用 scrypt 哈希存储，不保存明文
- 默认 `SECRET_KEY` 仅用于开发演示，生产环境必须更换

## 八、已知限制

- AI 答疑为规则回复，非真实 LLM
- 考试时间线部分仍为静态文案
- 无 favicon（不影响功能）
- `frontend/assets/*.html` 为旧原型副本，以 `frontend/` 根目录页面为准

## 九、文档索引

| 文档 | 用途 |
|------|------|
| `README.md` | 项目首页，快速开始 |
| `docs/DEPLOY_FROM_ZIP.md` | 压缩包换机启动指南（非 git clone，含 .env / venv 等坑） |
| `docs/PROJECT_STATUS.md` | 项目完成度跟踪 |
| `docs/HANDOFF.md` | 会话交接上下文 |
| `docs/ROADMAP.md` | 三周线性开发计划 |
| `docs/DEVELOPMENT_TIMELINE.md` | 实际开发进度与三周对应关系 |
| `PRD-civil-service-exam-tracker.md` | 产品需求文档 |
| `CONTEXT.md` | 领域词汇与业务规则 |
| `AGENTS.md` | Agent 协作规范与 API 路由地图 |
| `CLAUDE.md` | 项目协作规范 |
| `.cursorrules` | Cursor 编辑器项目上下文 |

## 十、快速参考卡片

```powershell
# 一键启动（两个终端分别执行）
cd backend  && python app.py
cd frontend && python -m http.server 8080

# 重置数据库
cd backend && python init_db.py

# 健康检查
curl http://localhost:5001/api/health

# 访问系统
start http://localhost:8080/login.html
```

---

> 本指南随项目版本更新，最新状态以 GitHub 仓库为准。
