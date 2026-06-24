# Handoff Document — 公务员考试学习跟踪系统

> **用途**：记录当前会话的上下文、已完成工作、待办事项和下一步动作，方便后续继续或交接给其他 agent。

## 最近一次更新

- **时间**：2026-06-24
- **会话动作**：使用 readme-polish skill 重写 README.md（新增环境准备、开机运行、换机实测检查清单、维护规范）；更新 CLAUDE.md 到最终状态；创建 `.cursorrules`；补全 `.gitignore` 忽略会话产物目录。
- **执行者**：Claude Fable 5

## 上一次更新

- **时间**：2026-06-23
- **会话动作**：题库种子扩容至 200 题 + 资源关联 + 多选支持 + 换机部署 README
- **执行者**：Grok Agent

## 当前上下文

**7 个核心模块均已实现**；题库与资源已通过 `resource_id` 关联；种子数据可满足科目/题型/资料筛选演示。

| 模块 | 状态 |
|------|------|
| 用户与账户 | ✅ |
| 考试资源管理 | ✅ |
| 智能学习计划 | ✅ |
| 题库与练习 | ✅（200 题，含多选） |
| 学习进度统计 | ✅ |
| 个性化推荐 | ✅ |
| 题目答疑留言 | ✅（AI 回复仍为规则演示） |

## 已完成（本次及近期会话）

### 题库与资源联动（方案 B）
- `questions.resource_id` 关联 `resources`
- `qa.html` 支持科目 + 资料来源 + 答题形式筛选
- `resource-detail.html`「开始练习」跳转 `qa.html?resource_id=`

### 种子数据扩容
- `init_db.sql`：**200 道题**（单选 152 / 判断 34 / 多选 14）
- 23 条资源（含 HTML 18–23 入库）
- 工具链：`seed_questions_from_html.py` → `patch_init_db.py` → `init_db.py`
- 备考指南（resource id=2）8 道规划类题

### 前端 / 后端
- `qa.js` 多选交互与空状态提示
- `answers.py` 多选答案规范化比对
- Dashboard 今日任务勾选 + FLIP 动画（`dashboard.js`）

### 部署文档
- 根目录 `README.md`：换机完整步骤、演示账号、验收路径、FAQ

## 待办（按优先级）

1. **答辩机实测**：按 `README.md` 在另一台电脑走一遍 clone → init_db → 双端口启动
2. **集中 Review**：用户主导排 UI/API 边角 bug
3. **可选**：考试时间线接 API、AI 答疑 LLM、emoji → SVG、favicon

## 换机运行（摘要）

```powershell
copy backend\.env.example backend\.env   # 填 MySQL 密码
cd backend
pip install -r requirements.txt
python init_db.py
python app.py                            # 5001

cd ..\frontend
python -m http.server 8080
```

访问 http://localhost:8080/login.html ，账号 `root` / `123456`。

## 已知限制

- AI 答疑为规则回复，非 LLM
- 考试时间线部分仍为静态文案
- 无 favicon（404，不影响功能）
- `frontend/assets/*.html`（assets 下）为旧原型副本，以 `frontend/` 根目录页面为准

## 未提交 / 需注意

换机依赖 **Git 中的 `init_db.sql`**，不依赖本机 MySQL 数据文件。改题后须 `git push`，另一台 `pull` + `init_db.py`。