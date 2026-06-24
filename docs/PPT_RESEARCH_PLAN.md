# PPT 汇报资料调研规划

> 目标：为「公务员考试学习跟踪系统」课程设计项目三周开发进度 PPT 收集各 Week 的展示素材、文案来源和关键数据。本规划供三个 agent 分别调研 Week 1 / Week 2 / Week 3 使用。

## 一、PPT 整体定位

- **受众**：课程设计答辩老师 / 课程汇报评审
- **风格**：学期项目周期性总结 + 预报性质展示
- **核心结构**：按 Week 1 → Week 2 → Week 3 线性展示，每页突出「本周目标 → 完成内容 → 关键产出 → 遇到的问题/亮点 → 下周计划」
- **数据来源**：项目文档、源码、commit 历史、设计资产

---

## 二、通用参考资料（三个 Week 都需要先读）

每个 agent 在开始调研前，应先通读以下全局文档，建立项目整体认知：

| 文档 | 用途 |
|------|------|
| `PRD-civil-service-exam-tracker.md` | 产品背景、目标用户、7 大模块功能定义、两阶段发布计划 |
| `CONTEXT.md` | 领域词汇、业务规则、命名规范 |
| `docs/PROJECT_STATUS.md` | 当前完成度、待办、关键决策 |
| `docs/DEVELOPMENT_TIMELINE.md` | 三周实际完成内容总览、PPT 关键数据 |
| `docs/ROADMAP.md` | 原始三周计划（Day 1-15 任务分解） |
| `AGENTS.md` | API 路由地图、文件命名规范、当前进度 |
| `README.md` | 项目首页、技术栈、快速开始、维护规范 |

---

## 三、Week 1 — 基础设施 + 核心数据

### 3.1 调研目标

整理 Week 1 用于 PPT 展示的素材：项目是如何从 0 开始搭建的，技术选型理由，数据库如何设计，用户与资源模块如何落地。

### 3.2 必须调阅的参考文档

| 文档/文件 | 需要提取的内容 |
|-----------|----------------|
| `docs/ROADMAP.md` — Week 1 | Day 1-5 的原始计划与完成项 |
| `docs/DEVELOPMENT_TIMELINE.md` — Week 1 | 实际完成内容表格 |
| `PRD-civil-service-exam-tracker.md` — 7.3 Technology | 技术栈、架构、数据库表设计 |
| `CONTEXT.md` — Naming conventions | 数据库/API/前端命名规范 |
| `AGENTS.md` — 后端路由地图 | 各 Blueprint 状态、API 响应格式 |
| `backend/init_db.sql` | 12 张核心表的 CREATE 语句、索引、种子数据 |
| `backend/app.py` | Flask 应用入口、Blueprint 注册 |
| `backend/config.py` | 数据库配置、SECRET_KEY |
| `backend/db.py` | 数据库连接方式 |
| `backend/routes/auth.py` | 注册/登录/登出/`/me` API 实现 |
| `backend/routes/resources.py` | 资源列表/详情 API 实现 |
| `frontend/login.html` / `register.html` | 登录注册页面结构 |
| `frontend/resources.html` | 资源库页面结构 |
| `frontend/js/auth.js` | 前端登录态管理 |
| `frontend/js/api.js` | API 封装、BASE_URL |
| `frontend/assets/init_db.sql` | 种子数据来源说明 |

### 3.3 需要调研并输出的素材

1. **技术选型一页**：为什么选 Flask + MySQL + 原生 HTML/CSS/JS？与 PRD 中约束的对应关系。
2. **架构图素材**：前后端分离架构图、数据库 ER 关系说明。
3. **数据库设计一页**：12 张表的作用、核心表结构截图或简化表格。
4. **用户模块一页**：注册/登录流程、Session 认证机制、密码 scrypt 哈希。
5. **资源模块一页**：资源分类、23 条资源概览、资源详情页效果。
6. **本周亮点/问题**：设计系统如何落地、 naming conventions 如何统一。

### 3.4 建议输出的 PPT 文案结构

```
Week 1 — 基础设施 + 核心数据
├── 项目启动与技术选型
├── 数据库设计（12 张核心表）
├── 用户与账户模块
├── 考试资源管理模块
└── Week 1 小结与下周衔接
```

---

## 四、Week 2 — 核心业务逻辑

### 4.1 调研目标

整理 Week 2 用于 PPT 展示的素材：题库、学习计划、进度统计、推荐、答疑五大核心业务模块的实现细节和算法逻辑。

### 4.2 必须调阅的参考文档

| 文档/文件 | 需要提取的内容 |
|-----------|----------------|
| `docs/ROADMAP.md` — Week 2 | Day 6-10 的原始计划与完成项 |
| `docs/DEVELOPMENT_TIMELINE.md` — Week 2 | 实际完成内容表格 |
| `PRD-civil-service-exam-tracker.md` — 7.2 关键功能 / 模块 4-7 | 题库、计划、进度、推荐、答疑的详细需求 |
| `CONTEXT.md` — Business rules | 弱项识别规则、推荐规则、计划覆盖规则 |
| `AGENTS.md` — 后端路由地图 | questions / answers / plans / progress / recommendations / comments Blueprint |
| `backend/routes/questions.py` | 题目列表/筛选 API |
| `backend/routes/answers.py` | 答题提交、历史、多选规范化比对 |
| `backend/routes/plans.py` | 学习目标、计划生成算法、plan_items 生成 |
| `backend/routes/progress.py` | 进度统计 API |
| `backend/routes/recommendations.py` | 弱项读取、推荐生成逻辑 |
| `backend/routes/comments.py` | 答疑留言 API |
| `frontend/qa.html` / `qa.js` | 题库练习页面与交互 |
| `frontend/plan.html` / `plan.js` | 学习计划页面 |
| `frontend/statistics.html` / `statistics.js` | 学习统计页面与图表 |
| `frontend/recommendations.html` / `recommendations.js` | 推荐页面 |
| `frontend/dashboard.html` / `dashboard.js` | Dashboard 数据接入 |
| `frontend/assets/init_db.sql` — questions 部分 | 200 道题的分布 |

### 4.3 需要调研并输出的素材

1. **题库模块一页**：题型分布（单选 152 / 判断 34 / 多选 14）、筛选方式、答题流程、多选答案比对。
2. **学习计划算法一页**：按科目权重 × 难度计算优先级、弱项加权 50%、每日任务分配、三阶段划分（基础/强化/冲刺）。
3. **进度统计一页**：统计维度、可视化图表、Dashboard 接入。
4. **弱项识别与推荐一页**：弱项规则（答题量 ≥ 5、正确率 < 60%）、推荐资源 + 同类题。
5. **答疑模块一页**：解析展示、留言 API、规则回复。
6. **200 题数据一页**：题目数量、科目覆盖、资源关联。

### 4.4 建议输出的 PPT 文案结构

```
Week 2 — 核心业务逻辑
├── 题库与练习模块
├── 智能学习计划生成（含算法）
├── 学习进度跟踪与统计
├── 弱项识别与个性化推荐
├── 题目解析与答疑
└── Week 2 小结与下周衔接
```

---

## 五、Week 3 — 完善、Review、演示

### 5.1 调研目标

整理 Week 3 用于 PPT 展示的素材：UI/UX 统一、测试调试、演示数据准备、文档整理、最终提交。

### 5.2 必须调阅的参考文档

| 文档/文件 | 需要提取的内容 |
|-----------|----------------|
| `docs/ROADMAP.md` — Week 3 | Day 11-15 的原始计划与完成项 |
| `docs/DEVELOPMENT_TIMELINE.md` — Week 3 | 实际完成内容表格 |
| `docs/frontend-design-review.md` | 前端设计 Review 记录 |
| `design-system/公务员考试学习跟踪系统/MASTER.md` | GPT 生成的设计系统 Token |
| `docs/HANDOFF.md` | 历次会话动作，尤其是 Week 3 的收尾工作 |
| `docs/PROJECT_STATUS.md` | 已完成清单、待办、可选优化 |
| `docs/PROJECT_GUIDE.md` | 部署与维护文档 |
| `docs/README.md` | 最终项目首页 |
| `backend/test_api.ps1` | PowerShell 冒烟测试 |
| `frontend/assets/styles.css` / `surfaces.css` | 全局样式与 Aceternity surface 样式 |
| `frontend/js/ui.js` / `shell.js` / `motion.js` | UI 交互、shell 动画 |
| `frontend/profile.html` / `profile.js` | 个人信息页与 admin 区块 |
| `frontend/dashboard.html` | Dashboard 最终效果 |
| git log `--oneline` | Week 3 相关 commit 列表（UI polish、bug fix、test、docs） |

### 5.3 需要调研并输出的素材

1. **UI/UX 统一一页**：设计系统 MASTER.md、Aceternity 风格迁移、颜色/字体/圆角规范、页面一致性。
2. **动画与交互一页**：页面过渡、FLIP 动画、热力图、加载 veil、Dashboard 今日任务勾选效果。
3. **测试与 Review 一页**：PowerShell 冒烟测试、手动验收路径、bug 修复记录。
4. **演示数据准备一页**：题库扩容至 200 题、资源 HTML 完善、`resource_id` 关联、多选支持。
5. **文档整理一页**：README、PROJECT_GUIDE、DEVELOPMENT_TIMELINE、.cursorrules 的作用。
6. **最终成果一页**：7 模块完成状态、可运行演示、GitHub 提交情况。

### 5.4 建议输出的 PPT 文案结构

```
Week 3 — 完善、Review、演示
├── UI/UX 统一与设计系统落地
├── 动画与交互优化
├── 测试、Review 与 Bug 修复
├── 演示数据准备（200 题 + 23 资源）
├── 文档整理与项目归档
└── 项目最终成果与后续计划
```

---

## 六、输出格式要求

每个 agent 调研完成后，请在 `.scratch/ppt-research/week<N>/` 目录下输出以下文件：

```
.scratch/ppt-research/
├── week1/
│   ├── SUMMARY.md          # Week 1 调研摘要，可直接用于 PPT 文案
│   ├── KEY_POINTS.md       # 每页 PPT 的 bullet points
│   ├── QUOTES.md           # 可直接引用的文档原文/代码片段
│   └── SCREENSHOTS.md      # 建议截图的位置和描述
├── week2/
│   └── ...
└── week3/
    └── ...
```

### 6.1 SUMMARY.md 模板

```markdown
# Week N 调研摘要

## 本周目标
（一句话）

## 实际完成内容
- 
- 

## 关键产出
- 
- 

## 核心数据
- 代码提交：x 次
- 新增/修改文件：
- 关键指标：

## 亮点与难点
- 亮点：
- 难点/解决方案：

## PPT 建议页数与标题
1. XXX
2. XXX
3. XXX
```

### 6.2 KEY_POINTS.md 模板

```markdown
# Week N PPT 要点

## 第 1 页：标题
- bullet 1
- bullet 2

## 第 2 页：标题
- bullet 1
- bullet 2
```

---

## 七、注意事项

1. **不要编造数据**：所有数字（提交次数、文件数、题目数）必须从 git log / init_db.sql / 文档中核实。
2. **代码片段引用要标注来源**：文件路径 + 行号范围。
3. **PPT 文案要口语化**：适合答辩现场讲述，避免大段复制文档。
4. **图表建议**：架构图、数据库 ER 图、算法流程图、模块依赖图、时间线甘特图。
5. **截图建议**：登录页、Dashboard、资源详情、题库练习、统计页、推荐页。
6. **突出课程设计价值**：不要写成产品手册，要体现「从 0 到 1 的开发过程」和「遇到的问题如何解决」。

---

## 八、任务分配

- **Agent A**：负责 Week 1 调研 → 输出 `.scratch/ppt-research/week1/`
- **Agent B**：负责 Week 2 调研 → 输出 `.scratch/ppt-research/week2/`
- **Agent C**：负责 Week 3 调研 → 输出 `.scratch/ppt-research/week3/`

三个 agent 并行工作，最终由汇总 agent 整合为 PPT 大纲或直接使用 `ppt-master` skill 生成 PPT。
