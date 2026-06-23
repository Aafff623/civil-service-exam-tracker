# 公务员考试学习跟踪系统

面向课程设计的公务员考试学习跟踪演示系统：Flask REST API + MySQL + 原生 HTML/CSS/JS。

## 换机 / 全新环境运行（必读）

按顺序执行即可在另一台电脑上完整跑起来。**题目与演示数据都在 Git 里的 `frontend/assets/init_db.sql`，不要拷贝本机数据库文件。**

### 1. 环境要求

| 组件 | 版本建议 |
|------|----------|
| Python | 3.10+ |
| MySQL | 8.0+ |
| Git | 任意近期版本 |

### 2. 获取代码

```powershell
git clone https://github.com/Aafff623/civil-service-exam-tracker.git
cd civil-service-exam-tracker
```

### 3. 配置 MySQL

1. 启动 MySQL 服务（本机或远程均可）。
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

### 4. 安装 Python 依赖

```powershell
cd backend
python -m pip install -r requirements.txt
```

### 5. 初始化数据库（含 200 道种子题）

```powershell
python init_db.py
```

成功时会输出数据库名与 SQL 来源路径。此步骤会**删表重建**并导入：

- 7 个科目、23 条备考资源
- **200 道** `questions`（单选 / 多选 / 判断）
- 演示用户、学习计划、答题记录等

### 6. 启动服务

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

### 7. 访问与验收

| 地址 | 说明 |
|------|------|
| http://localhost:8080/login.html | 登录页 |
| http://localhost:5001/api/health | 后端健康检查（无需登录） |

**演示账号**（密码均为 `123456`）：

| 用户名 | 角色 | 说明 |
|--------|------|------|
| root | admin | 数据最全，适合答辩演示 |
| testuser1 | user | 有计划与答题记录 |
| testuser2 | user | 接近新用户空状态 |
| testuser3 | user | 少量答题，测弱项推荐 |

**建议验收路径**：登录 → 考试与资源 → 资源详情「开始练习」→ 题库与练习（切换科目 / 资料 / 多选）→ 学习统计 / 推荐。

---

## 日常开发命令

| 操作 | 命令 |
|------|------|
| 重置数据库 | `cd backend && python init_db.py` |
| 审计题库分布 | `cd backend && python _audit_questions.py` |
| 从 HTML 重新生成题目 SQL | `cd backend && python seed_questions_from_html.py && python patch_init_db.py` |

生成脚本会更新 `frontend/assets/init_db.sql` 中的 `INSERT INTO questions`；`_generated_questions.sql` 为中间产物，可忽略。

---

## 项目结构（简要）

```
backend/          Flask API（端口 5001）
frontend/         静态页面 + js/api.js
frontend/assets/init_db.sql   唯一数据源（种子 SQL）
docs/             HANDOFF、PROJECT_STATUS
AGENTS.md         Agent 协作与 API 地图
CONTEXT.md        领域词汇
```

---

## 常见问题

**Q：换机后题库为空？**  
A：未执行 `python init_db.py`，或 `.env` 连错库。确认 `GET /api/questions` 需登录后是否有数据。

**Q：前端能开但接口 401 / 连不上？**  
A：确认后端在 5001 运行；`frontend/js/api.js` 中 `API_BASE_URL` 为 `http://localhost:5001/api`。

**Q：改题目后另一台机没更新？**  
A：需提交并推送 `frontend/assets/init_db.sql`，另一台 `git pull` 后重新 `init_db.py`。

**Q：需要 SQLite 吗？**  
A：不需要。当前栈为 **MySQL + PyMySQL**（见 `backend/requirements.txt`）。

---

## 文档索引

- 协作规范：`AGENTS.md`
- 交接上下文：`docs/HANDOFF.md`
- 完成度：`docs/PROJECT_STATUS.md`
- 产品需求：`PRD-civil-service-exam-tracker.md`