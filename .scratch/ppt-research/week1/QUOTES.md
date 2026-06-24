# Week 1 可直接引用的文档原文与代码片段

## 1. 技术选型原文

> 技术选型以「简单、可演示、易维护」为原则：后端 Python Flask（RESTful API，Session 认证），数据库 MySQL 8.0+（演示数据通过 `init_db.sql` 一键导入），前端原生 HTML/CSS/JS（无框架，降低答辩环境搭建成本）。

来源：`README.md` 第 36-40 行

---

## 2. 架构描述原文

> 本项目为数据结构课程设计，目标是为备考公务员考试的在校大学生提供一套轻量级学习跟踪系统。项目采用三周规划，实际开发集中在 2026-06-23 至 2026-06-24 完成全部功能。

来源：`docs/DEVELOPMENT_TIMELINE.md` 第 7-8 行

---

## 3. 数据库表清单（12 张）

```sql
CREATE TABLE subjects (...)
CREATE TABLE users (...)
CREATE TABLE goals (...)
CREATE TABLE resources (...)
CREATE TABLE questions (...)
CREATE TABLE answers (...)
CREATE TABLE plans (...)
CREATE TABLE plan_items (...)
CREATE TABLE progress (...)
CREATE TABLE weak_points (...)
CREATE TABLE recommendations (...)
CREATE TABLE comments (...)
```

来源：`frontend/assets/init_db.sql` 第 44-189 行

---

## 4. 统一 API 响应格式

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

来源：`CONTEXT.md` 第 103-109 行 / `AGENTS.md` 第 59-67 行

---

## 5. Session 认证装饰器

```python
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return decorated_function
```

来源：`backend/routes/auth.py` 第 11-17 行

---

## 6. 密码哈希（scrypt）

```python
from werkzeug.security import generate_password_hash, check_password_hash
password_hash = generate_password_hash(password)
```

来源：`backend/routes/auth.py` 第 3、51 行

---

## 7. 资源列表 API（带筛选）

```python
@bp.route('/', methods=['GET'])
@login_required
def list_resources():
    subject_id = request.args.get('subject_id', type=int)
    resource_type = request.args.get('type', '').strip()
    # ... SQL 查询带条件筛选
```

来源：`backend/routes/resources.py` 第 11-56 行

---

## 8. 前端 API 封装

```javascript
const API_BASE_URL = 'http://localhost:5001/api';
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    };
    // ...
}
```

来源：`frontend/js/api.js` 第 1-25 行

---

## 9. 命名规范原文

> 表名：小写，复数形式，下划线分隔，如 `users`、`plan_items`
> 字段名：小写，下划线分隔，如 `user_id`、`created_at`
> 主键：`id`（自增整数）
> 外键：`<表名>_id`，如 `user_id`、`subject_id`

来源：`CONTEXT.md` 第 94-98 行

---

## 10. 数据库配置

```python
class Config:
    SECRET_KEY = SECRET_KEY
    MYSQL_HOST = MYSQL_HOST
    MYSQL_PORT = MYSQL_PORT
    MYSQL_USER = MYSQL_USER
    MYSQL_PASSWORD = MYSQL_PASSWORD
    MYSQL_DATABASE = MYSQL_DATABASE
    DEBUG = True
```

来源：`backend/config.py` 第 17-23 行

---

## 11. 数据库连接

```python
def get_db():
    return pymysql.connect(
        host=current_app.config['MYSQL_HOST'],
        port=current_app.config['MYSQL_PORT'],
        user=current_app.config['MYSQL_USER'],
        password=current_app.config['MYSQL_PASSWORD'],
        database=current_app.config['MYSQL_DATABASE'],
        charset='utf8mb4',
        cursorclass=DictCursor,
        autocommit=False,
    )
```

来源：`backend/db.py` 第 6-16 行

---

## 12. Flask 应用入口与 Blueprint 注册

```python
from routes import health, auth, resources, subjects, questions, answers, plans, progress, recommendations, comments

app.register_blueprint(health.bp)
app.register_blueprint(auth.bp)
app.register_blueprint(resources.bp)
# ... 共 10 个 Blueprint
```

来源：`backend/app.py` 第 13-24 行

---

## 13. 前端登录表单

```html
<form id="login-form">
  <div class="field">
    <label for="username">用户名</label>
    <input class="input" type="text" id="username" placeholder="用户名" required />
  </div>
  <div class="field">
    <label for="password">密码</label>
    <input class="input" type="password" id="password" placeholder="密码" required />
  </div>
  <button class="btn primary" type="submit" id="login-btn" style="width:100%;">登录</button>
</form>
```

来源：`frontend/login.html` 第 65-75 行

---

## 14. 资源类型约束

```sql
CHECK (type IN ('大纲', '真题', '模拟题', '资料', '公告'))
```

来源：`frontend/assets/init_db.sql` 第 85 行

---

## 15. 演示账号数据

```sql
INSERT INTO users (id, username, password_hash, role) VALUES
(1, 'root', 'scrypt:...', 'admin'),
(2, 'testuser1', 'scrypt:...', 'user'),
(3, 'testuser2', 'scrypt:...', 'user'),
(4, 'testuser3', 'scrypt:...', 'user');
```

来源：`frontend/assets/init_db.sql` 第 213-217 行
