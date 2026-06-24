# 压缩包换机启动指南（DEPLOY FROM ZIP）

> 适用场景：**把整个项目打包成压缩包 → 发到另一台电脑 → 解压 → 启动**（不是 git clone）。
> 照着本文从上到下打勾即可。git clone 方式见 `PROJECT_GUIDE.md`。

---

## 0. 先搞清楚一件事：数据不在前端

很多人以为「前端自带 mock 数据」。**本项目不是这样**：

- 前端是个**空壳**，自己不存任何数据；每打开一个页面，都通过 `fetch` 向后端（5001）要数据。
- 后端再去 **MySQL** 取数据返回。
- 所有演示数据的**唯一来源**是 `frontend/assets/init_db.sql`（它是「数据库种子脚本」，虽然放在 frontend 目录下，但跟前端渲染无关）。
- `python init_db.py` 读这个 SQL，**删库重建**并灌入：200 题、23 资源、7 科目、4 个演示账号及其计划/答题记录。

```
frontend/assets/init_db.sql
        │  python init_db.py 导入
        ▼
   MySQL (200题 / 23资源 / 7科目 / 4账号)
        │  后端 app.py 查询
        ▼
   Flask API  : http://localhost:5001
        │  前端 fetch 请求
        ▼
   前端页面    : http://localhost:8080   ← 这里才"看起来有数据"
```

**所以启动顺序必须是：数据库 → 后端 → 前端。**

---

## 1. 新电脑要先准备的东西（压缩包里没有，必须自己装）

- [ ] **Python 3.10 或更高**（自带 pip）。验证：`python --version`
- [ ] **MySQL 8.0 或更高**，并且：
  - [ ] MySQL 服务已**启动**（Windows：`net start MySQL80`）
  - [ ] **知道 root 密码**（下一步要填进 `.env`）。验证：`mysql -u root -p -e "SELECT VERSION();"`

> 不需要装 Node.js（前端是纯静态文件，用 Python 自带的 http server 就能跑）。
> 不需要装 Git（因为是压缩包传输，不是 clone）。

---

## 2. 打包方（发送方）打包前注意

为避免换机踩坑，**压缩前**最好处理一下：

- [ ] **删掉 `backend/.env`**（它带着你这台机器的 MySQL 密码，换机无效，反而误导）。让对方从 `.env.example` 重新建。
- [ ] **不要把虚拟环境 `venv/`、`__pycache__/` 打进去**（里面是绝对路径，换机直接报废）。对方解压后重新 `pip install` 即可。
- [ ] `backend/database.db`（弃用的 SQLite 文件）、`cookies.txt` 带不带都行，无影响。

> 必须保留在压缩包里的关键文件：`frontend/assets/init_db.sql`（演示数据的命根子）、`backend/requirements.txt`、`backend/.env.example`、全部 `backend/` 与 `frontend/` 源码。

---

## 3. 解压后的启动流程（逐条执行）

### 第 1 步：数据库

```powershell
cd backend
copy .env.example .env
```

用记事本打开 `backend/.env`，把 `MYSQL_PASSWORD` 改成**这台机器的 MySQL 密码**：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=改成你自己机器的MySQL密码
MYSQL_DATABASE=civil_service_exam
SECRET_KEY=dev-secret-key-change-in-production
```

然后安装依赖并初始化数据库：

```powershell
python -m pip install -r requirements.txt
python init_db.py
```

看到下面这样的输出 = 数据已成功灌入 MySQL：

```text
Initialized MySQL database: civil_service_exam on localhost:3306
SQL source: ...\frontend\assets\init_db.sql
```

> `init_db.py` 会**删除并重建** `civil_service_exam` 库，确认 `.env` 没填错别的库名。

### 第 2 步：后端（这个终端**不要关**）

```powershell
python app.py
```

看到 `Running on http://127.0.0.1:5001` 即成功。

### 第 3 步：前端（**另开一个新终端**）

```powershell
cd frontend
python -m http.server 8080
```

---

## 4. 验证启动成功

- [ ] 浏览器访问 `http://localhost:5001/api/health` → 返回 `"status": "ok"`
- [ ] 浏览器访问 `http://localhost:8080/login.html`
- [ ] 用 `root` / `123456` 登录
- [ ] Dashboard 有数据、题库有 200 题、统计页有图表

全部满足 = 换机部署完成。

---

## 5. 常见问题（换机最容易遇到的）

| 现象 | 原因 | 解决 |
|------|------|------|
| `init_db.py` 报连接错误 | `.env` 密码错 / MySQL 服务没启动 | 核对 `MYSQL_PASSWORD`；`net start MySQL80` |
| 登录页报 `Failed to fetch` | 后端没启动 / 没访问 8080 而是双击了 html | 确认 `app.py` 在跑；用 `http://localhost:8080/...` 打开，不要 `file://` |
| 能登录但题库/数据为空 | 没跑 `init_db.py`，或连错了库 | 在 `backend` 下重新 `python init_db.py` |
| 依赖安装报编译错误 | 个别环境缺 C++ 工具 | `python -m pip install --upgrade pip setuptools wheel` 后重试；详见 `PROJECT_GUIDE.md` 6.4 |

---

## 6. 一句话速记

> **装 Python + MySQL → 填 `.env` 密码 → `init_db.py`（灌数据）→ `app.py`（后端 5001）→ `http.server 8080`（前端）→ 开 login.html。**

更详细的环境准备、维护、备份说明见 `PROJECT_GUIDE.md`。
