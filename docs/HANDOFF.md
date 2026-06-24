# Handoff Document — 公务员考试学习跟踪系统

> **用途**：记录当前会话的上下文、已完成工作、待办事项和下一步动作，方便后续继续或交接给其他 agent。

## 最近一次更新（三周规划文档替换）

- **时间**：2026-06-24
- **执行者**：Claude（kimi-for-coding）
- **主题**：用新的「三周功能完成清单」替换原 `ROADMAP.md`，并维护相关引用

### 本次完成

1. **替换三周规划文档**：删除 `docs/ROADMAP.md`（英文、Day 1–15 勾选清单），新增 `docs/三周功能完成清单.md`（按 Week 1/2/3 列主要任务 / 完成内容 / 阶段交付物 + 总体完成表 + 推荐演示流程）
2. **维护入站引用**：`README.md`、`.cursorrules`、`docs/README.md`、`docs/PROJECT_GUIDE.md`、`docs/DEVELOPMENT_TIMELINE.md`（Day 1 文档名 + 「初始计划」路径）、`docs/archive/ppt-production.md` 全部改指新文件名；过时描述（Day 1–15）一并修正
3. **PROJECT_STATUS.md**：移除已失效的可选项「同步更新 ROADMAP 勾选状态」（新文档已全部标记完成）

> 范围仅 `docs/` 与根目录引用文件；`docs/ppt/*.pptx` 与 `frontend/assets/auth.css` 的既有未提交改动仍未提交。

---

## 上一次更新（docs 目录精炼整理）

- **时间**：2026-06-24
- **执行者**：Claude（kimi-for-coding）
- **主题**：精炼 docs 目录，合并冗余、归档过时、加导航索引

### 本次完成

1. **合并 3 个 PPT 过程文档** → `docs/archive/ppt-production.md`（`PPT_CHECKLIST.md` / `PPT_PRODUCTION_PLAN.md` / `PPT_RESEARCH_PLAN.md` 已 `git rm`，全部唯一信息保留）
2. **归档过时设计评审**：`git mv docs/frontend-design-review.md` → `docs/archive/`，顶部加历史快照横幅
3. **新增 `docs/README.md` 文档导航索引**：按用途分类（上手部署 / 进度计划 / 交接 / 规范 / 答辩材料 / 历史归档）
4. **补 `docs/adr/README.md` 占位**：说明 ADR 目录用途（被 `agents/domain.md`、`agents/module-development-workflow.md` 引用，暂无记录）
5. **修引用**：`HANDOFF.md` 对 3 个 PPT_*.md 的提及改指 `archive/ppt-production.md`；`PROJECT_GUIDE.md` 第九节文档索引补 `docs/README.md` 一行
6. 范围严格限定 `docs/`，未触碰 `frontend/` / `backend/` / 根目录文件；`docs/ppt/*.pptx` 与 `frontend/assets/auth.css` 的既有未提交改动未一并提交

### docs/ 最终结构

```
docs/
├─ README.md              导航索引（总入口）
├─ PROJECT_GUIDE.md / DEPLOY_FROM_ZIP.md                    上手与部署
├─ PROJECT_STATUS.md / 三周功能完成清单.md / DEVELOPMENT_TIMELINE.md  进度与计划
├─ HANDOFF.md             交接日志
├─ banner.png             README 横幅
├─ adr/(README.md) · agents/(4 规范)                        协作规范
├─ ppt/                   答辩材料（4 pptx + screenshots/）
└─ archive/               历史归档（ppt-production.md · frontend-design-review.md）
```

---

## 上一次更新（Review 与收尾提交）

- **时间**：2026-06-24
- **执行者**：Claude（kimi-for-coding）
- **主题**：集中代码 Review + 收尾提交 + 数据复位

### 本次完成

1. **代码 Review 通过**（重点排 SQLite→MySQL 迁移残留与判分）
   - 判分逻辑：单选 / 多选 / 判断 + 多选乱序，**运行时端到端实测全部正确**（`normalize_answer` 前后端镜像、A–D 字典序比较）
   - 11 个后端路由全部参数化 `%s`，**零 SQLite 残留、无注入**（批量删除按 int 强转后拼占位符）
   - 11 个前端页面均返回 200；`api.js` 全局 `credentials:'include'`
   - 数据闭环：200 题 = 单字母 186（单选 152 + 判断 34）+ 多选 14，与全仓口径一致
2. **删除死代码** `backend/routes/users.py`（从未注册的空壳蓝图，资料功能实由 `/api/auth/me` 提供）
3. **提交并推送**：5 个文档维护文件 + `users.py` 删除（两个原子提交）
4. **复位 root 演示数据**：实测往 root 写入的 7 条答题记录已用 `init_db.py` 清除，root 回到种子基线（`total_answers=19 / accuracy=78.9 / completed=54`）

### Review 标记的低优先项（未处理，已记入 `PROJECT_STATUS.md` 可选后续）

- 异常路径连接泄漏：`register()` / `create_subject()` 的 `except` 分支未 `conn.close()`（演示负载无感）
- CORS `origins=["*"]` + credentials（Flask-CORS 回显 origin，本地正常）
- 计划生成对超长考期无上限（正常日期无影响）

### 仍待办

- **答辩机换机实测**：按 `README.md` / `PROJECT_GUIDE.md` 在另一台机走 clone → `.env` → `init_db.py` → 双端口
- `frontend/assets/auth.css`（登录页单屏优化）仍按用户要求**不提交**，留作工作区改动

---

## 上一次更新（README 风格化 / 登录页 / 文档维护）

- **时间**：2026-06-24
- **执行者**：Claude（kimi-for-coding）
- **会话主题**：README 风格化、登录页单屏优化、全仓文档一致性维护

### 本次完成

1. **README 重写为 `agent-cfo` 风格**（参照 `D:\OneDrive\Desktop\threetwoa\my-competition\agent-cfo`）
   - 居中头部 + 标语 + 暗色徽章 + 导航行 + 「为什么需要」+ 功能表 + 截图展示网格 + 折叠快速开始 + 架构图 + API 表 + 路线图 + 文档索引 + Star History
   - 新增项目横幅 `docs/banner.png`（1600×640，用户提供）
   - 截图展示复用 `docs/ppt/screenshots/*.png`（8 张真实截图）
   - **已提交并推送：`cf419f8`**（`origin/master`，仅含 `README.md` + `docs/banner.png`）

2. **登录页单屏优化** — `frontend/assets/auth.css`（**未提交**，用户明确说登录页改动「不需要 commit」）
   - 根因：`body` 与 `.auth-page` 用 `min-height:100vh`，左侧品牌栏内容超出视口 → 整页纵向滚动条
   - 修复：锁定为 `height:100dvh` + `overflow:hidden`；flex 子项 `min-height:0`；收紧竖向节奏；`@media (max-height:860px)` 隐藏评价语、`≤700px` 隐藏能力标签/页脚；表单栏 `overflow-y:auto` 兜底
   - 同套样式 `register.html` 一并受益

3. **全仓文档一致性维护**（**均未提交**）
   - `AGENTS.md`：技术栈 **SQLite→MySQL 8.0+（PyMySQL）**；`init_db` 描述改为 MySQL 删表重建；配置键改 `MYSQL_*`；路由地图补全（resources 的 POST/DELETE/batch-delete、subjects 的 POST）；`goals` 行标注「并入 `/api/plans/goal`」；页面地图补 `resource-detail.html`、`profile.html`；技术债刷新（删除「种子题仅 4 道」「ROADMAP 滞后」）；日期 2026-06-24
   - `PRD-...md`：3 处 SQLite→MySQL，并保留「初稿 SQLite 后迁移」一句说明（保住答辩叙事）
   - `docs/PROJECT_GUIDE.md`：`init_db.py` 输出样例改为真实输出
   - `docs/PROJECT_STATUS.md`：已完成清单补本次 3 项

### 已核对一致的数据事实（全仓口径统一）

- **题库 200 题**：单选 152 / 多选 14 / 判断 34（源：`frontend/assets/init_db.sql` 第 245–445 行）
- **资源 23 条**、**科目 7 个**、**账号 4 个**（`root`=admin，`testuser1-3`=user，密码均 `123456`，scrypt 哈希）
- **12 张表**：subjects/users/goals/resources/questions/answers/plans/plan_items/progress/weak_points/recommendations/comments
- 栈确认为 **Flask 3.0 + MySQL 8.0/PyMySQL + 原生前端**；`recommendations` 表无种子（运行时规则生成）

### 当前运行状态（本会话后台进程，转交后可能需重启）

- 后端 Flask：`http://localhost:5001`（PID 26012），`/api/health` 返回 ok
- 前端静态站：`http://localhost:8080`（PID 42696），`login.html` 200
- 重启命令见下方「换机运行（摘要）」或 `docs/PROJECT_GUIDE.md`

### Git 状态（交接时）

- 分支 `master` 与 `origin/master` 齐平；最后推送 `cf419f8`
- **工作区未提交改动**（待下一个 agent / 用户决定是否提交）：
  - `frontend/assets/auth.css`（登录页，用户说不 commit）
  - `AGENTS.md` · `PRD-civil-service-exam-tracker.md` · `docs/PROJECT_GUIDE.md` · `docs/PROJECT_STATUS.md` · `docs/HANDOFF.md`（本次文档维护）
  - `docs/ppt/...答辩.pptx`：**会话开始前就已修改，非本次所做**，未处理，勿误认为本次产物
- 未跟踪的本地文件（`.gitignore` 内，勿提交）：`backend/database.db`（SQLite 遗留，弃用）、`cookies.txt`、`backend/cookies.txt`

### 下一步建议（按优先级）

1. **确认提交策略**：文档维护那批是否提交？（auth.css 用户已表态不提交）
2. **答辩机换机实测**：按 `README.md` / `PROJECT_GUIDE.md` 在另一台机走 clone → `.env` → `init_db.py` → 双端口
3. **集中 Review**：用户主导排 UI/API 边角 bug
4. 可选：AI 答疑接真实 LLM、考试时间线接资源 API、emoji→SVG、favicon

> 注：项目根目录 `CLAUDE.md` 已核对，状态描述（栈/端口/200 题/剩余工作）准确，本次未改。

---

## 上一次更新

- **时间**：2026-06-24
- **会话动作**：
  - 生成最终总览答辩 PPT：`docs/ppt/公务员考试学习跟踪系统答辩.pptx`（18 页）
  - 总览 PPT 覆盖项目背景、Week 1/2/3 全部内容、最终成果与 Q&A
  - 在对应 slide 预留系统截图 / 架构图 / ER 图位置（蓝色虚线占位框）
  - 占位位置包括：架构图、ER 图、登录页/资源库、题库、计划、统计、推荐、答疑、Dashboard、最终成果缩略图
  - 使用 `python-pptx` 直接生成，中文编码正确，无文字溢出
  - 新增生成脚本：`.scratch/generate_final_ppt.py`
  - 当前 PPT 资产清单：
    - `docs/ppt/Week1_公务员考试学习跟踪系统_阶段汇报.pptx`（10 页）
    - `docs/ppt/Week2_公务员考试学习跟踪系统_阶段汇报.pptx`（12 页）
    - `docs/ppt/Week3_公务员考试学习跟踪系统_答辩.pptx`（14 页）
    - `docs/ppt/公务员考试学习跟踪系统答辩.pptx`（18 页，最终答辩稿）
    - `docs/ppt/screenshots/*.png`（8 张系统截图，未嵌入）
- **执行者**：Claude Fable 5

## 上一次更新

- **时间**：2026-06-24
- **会话动作**：
  - 新增 `docs/PPT_PRODUCTION_PLAN.md` 与 `docs/PPT_CHECKLIST.md`（已于 2026-06-24 合并入 `docs/archive/ppt-production.md`）
  - 选定 `ppt-master` 模板：`academic_defense`
  - 初始化 ppt-master 项目：`civil_service_defense_ppt169_20260624`
  - 汇总 Week 1-3 调研报告为 `SOURCE_ALL.md` 并导入项目
  - 生成 `design_spec.md` 与 18 页 SVG 幻灯片
  - 完成 ppt-master 后处理，导出原生可编辑 PPTX
  - 将 `公务员考试学习跟踪系统答辩.pptx` 复制到 `docs/ppt/`
- **执行者**：Claude Fable 5

## 补充（同次会话后续）

- 截取 8 张系统运行截图（登录 / Dashboard / 资源 / 题库 / 统计 / 推荐 / 计划 / 个人资料）
- 将截图嵌入 `docs/ppt/公务员考试学习跟踪系统答辩.pptx`
- PDF 导出因环境缺少 LibreOffice / PowerPoint COM 未自动完成，需手动另存为 PDF

## 上一次更新

- **时间**：2026-06-24
- **会话动作**：
  - 使用 readme-polish skill 重写 README.md
  - 更新 CLAUDE.md 到最终状态
  - 创建 `.cursorrules`
  - 补全 `.gitignore`
  - 新增 `docs/PROJECT_GUIDE.md` 详细项目使用指南
  - 新增 `docs/DEVELOPMENT_TIMELINE.md` 梳理三周开发进度
  - 更新 `docs/ROADMAP.md` 全部任务标记为完成（该文件后于 2026-06-24 替换为 `docs/三周功能完成清单.md`）
  - 新增 `docs/PPT_RESEARCH_PLAN.md`，为 Week 1/2/3 PPT 调研分配任务和资料来源（已合并入 `docs/archive/ppt-production.md`）
- **执行者**：Claude Fable 5

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