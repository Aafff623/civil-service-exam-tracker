# Aceternity 移植实施计划

> 基于 `AUDIT.md` | 分支策略：`explore/aceternity-surfaces` → 验收后合并 `master`  
> 栈约束：vanilla HTML/CSS/JS only

---

## 目标

在 **不改动后端 API** 的前提下，用 Aceternity 的 **dashboard shell、中性 KPI、spotlight 卡片、认证装饰** 等模式，降低「AI 模板感」，对齐 `MASTER.md` 政府/可信视觉。

---

## 阶段总览

| 阶段 | 名称 | 审计 ID | 产出 | 预估 |
|------|------|---------|------|------|
| **0** | 基线（已完成） | Done×7 | `surfaces.css`, spotlight JS | — |
| **1** | 文档与验收基线 | — | 本 AUDIT + PLAN；截图对比 | 0.5d |
| **2** | 全局表面补齐 | P-01,P-07,P-08,P-09 | KPI 外框、网格底纹、表单 focus | 1d |
| **3** | 卡片与入口 | P-05,P-06,R-04,R-07 | index/resources/reco/plan 卡面 | 1.5d |
| **4** | 认证页 | P-03,P-04,R-03 | login/register 双栏质感 | 1d |
| **5** | 导航与区块 | R-01,R-05,R-02 | 移动侧栏、plan stepper、时间线 | 2d |
| **6** | 合并与回归 | — | merge master、更新 HANDOFF | 0.5d |

**合计**：约 6.5 人日（可并行页面验收）。

---

## Phase 0 — 已完成 ✅

**Commit**：`b520115` on `explore/aceternity-surfaces`

| 文件 | 变更 |
|------|------|
| `frontend/assets/surfaces.css` | shell、sidebar、card、kpi、btn、tabs、spotlight |
| `frontend/assets/styles.css` | `@import surfaces.css` |
| `frontend/js/ui.js` | `initSurfaceSpotlight()` |
| `frontend/js/app.js` | resource-card 加 `surface-spotlight` |
| `frontend/js/recommendations.js` | reco-card 加 `surface-spotlight` |

**验收**：
- [x] 侧栏 + 主区 inset 白面板
- [x] KPI 无彩虹顶边（explore 分支）
- [x] 资源/推荐卡 hover 光斑
- [ ] 全站其他卡尚未加 spotlight（Phase 3）

---

## Phase 1 — 文档与视觉基线

### 任务

1. ✅ 输出 `AUDIT.md` + `PLAN.md`（本文件）
2. 在 `explore` 分支启动前后端，截取 8 页 before/after 放入 `.scratch/aceternity-explore/screenshots/`（可选）
3. 对照 showcase：记录选用的 block 编号（如 `stats-sections/2`）

### 验收

- [ ] 审计矩阵覆盖全部 18 个 component-pack 分类
- [ ] 每页有明确 Port/Replace/Defer 标注

---

## Phase 2 — 全局表面补齐

**Issue 建议**：`.scratch/aceternity-explore/issues/02-global-surfaces.md`

### P-01 GridPattern 底纹

- **参考**：`stats-sections/2.tsx` → `Grid` SVG pattern
- **落点**：`.grid-4`, `.grid-5` 外包 `.kpi-strip` 或伪元素背景
- **实现**：`surfaces.css` 新增 `.kpi-strip::before` SVG data-uri 或 `assets/grid-pattern.svg`
- **策略**：Port

### P-07 KPI 统一外框

- **参考**：`stats-sections/2` 单容器 `border` + 列间 `border-r`
- **落点**：dashboard.html、statistics.html 的 KPI section
- **HTML**：可选包一层 `<section class="kpi-strip grid grid-4">`（Replace 轻量）
- **策略**：Port + 轻 Replace

### P-08 Topbar 网格线

- **参考**：`saas-template/components/grid-lines.tsx`
- **落点**：`.topbar::after` 1px 渐变线
- **策略**：Port

### P-09 表单 focus

- **参考**：Aceternity input `ring-2 ring-neutral-200`
- **落点**：`.input:focus`, `.select:focus` in `styles.css` 或 `surfaces.css`
- **策略**：Port

### 文件清单

```
frontend/assets/surfaces.css
frontend/dashboard.html          # kpi-strip 包裹（若做 P-07）
frontend/statistics.html
```

### 验收标准

- [ ] KPI 区呈现「一条统计带」而非四/五块独立彩虹卡
- [ ] 网格底纹在 1080p 下可见但不抢眼（opacity ≤ 0.4）
- [ ] Tab 聚焦可见（WCAG 2.4.7）
- [ ] `prefers-reduced-motion` 下无 spotlight 闪烁（已有）

### Commit 建议

```
style(frontend): add KPI strip grid pattern and form focus rings
```

---

## Phase 3 — 卡片与模块入口

**Issue**：`.scratch/aceternity-explore/issues/03-cards-and-index.md`

### P-05 index spotlight

- **落点**：`index.html` `.card.module-link` → 加 `surface-spotlight`
- **JS**：`app.js` 页加载时 `initSurfaceSpotlight()`（若未调用）

### P-06 扩展 spotlight

- **落点**：`.plan-stat-card`, dashboard `.weak-panel`, `.countdown-card`（可选）
- **策略**：Port，仅 class + 已有 JS

### R-04 资源卡布局（可选增强）

- **参考**：`cards/4` author row
- **落点**：`app.js` 中 `resource-card` 模板：thumb + meta 横排
- **注意**：保留 `resource-batch-check`、`data-resource-id`
- **策略**：Replace（JS 模板字符串）

### R-07 index Bento 网格

- **参考**：`bento-grids/1` 不规则跨度
- **落点**：`index.html` `grid-3` → CSS `grid-template-areas` 让 01/06 大卡
- **策略**：Replace（仅 HTML+CSS）

### 验收标准

- [ ] index 六模块视觉层次明显（一大一小对比）
- [ ] resources 列表卡信息密度不低于现版
- [ ] 批量选择与详情跳转行为不变

### Commit 建议

```
style(frontend): extend spotlight and refresh index/resource cards
```

---

## Phase 4 — 认证页

**Issue**：`.scratch/aceternity-explore/issues/04-auth-panels.md`

### P-03 GridPattern 背景

- **参考**：`foxtrot/.../GridPattern.tsx`
- **落点**：`auth.css` → `.auth-brand` 背景层
- **注意**：保持文字对比度 ≥ 4.5:1（曾修过 scrim）

### P-04 GridLine 装饰

- **参考**：`login-and-signup/1` `GridLineHorizontal/Vertical`
- **落点**：`.auth-form-panel` 四角细线（伪元素）

### R-03 Testimonial 结构

- **参考**：`login-and-signup/1` `FeaturedTestimonials`
- **落点**：`.auth-brand-inner` 增加 2–3 条静态备考语录（无 API）
- **策略**：Replace（HTML 片段）

### 文件

```
frontend/assets/auth.css
frontend/login.html
frontend/register.html
```

### 验收标准

- [ ] 登录/注册提交与跳转正常
- [ ] 左侧品牌区在 1366×768 可读
- [ ] 移动端单栏折叠逻辑不变

### Commit 建议

```
style(auth): aceternity grid pattern and testimonial panel
```

---

## Phase 5 — 导航与功能区块

**Issue**：`.scratch/aceternity-explore/issues/05-nav-stepper-timeline.md`

### R-01 移动端侧栏

- **参考**：`sidebars/1` mobile drawer
- **落点**：`ui.js` + `styles.css`：`<button class="nav-toggle">` + `.sidebar.is-open`
- **策略**：Replace
- **Defer 部分**：Framer AnimatePresence → CSS `transform: translateX`

### R-05 Plan stepper

- **参考**：Aceternity 多步表单视觉
- **落点**：`plan.html` + `styles.css` `.stepper` 连线圆点
- **策略**：Replace（纯 CSS）

### R-02 考试时间线

- **参考**：`stats-sections/1` 竖向 changelog 时间轴
- **落点**：`dashboard.js` 渲染 `#dashboard-milestones` 或新 `#exam-timeline`
- **数据**：暂用静态/种子；接 API 为后续
- **策略**：Replace

### R-06 FAQ（可选）

- **落点**：`qa.html` 底部「使用说明」`<details>` 手风琴
- **优先级**：低

### 验收标准

- [ ] 宽度 &lt; 860px 可打开/关闭侧栏且不占位挡内容
- [ ] plan 三步 stepper 当前步高亮清晰
- [ ] 时间线至少 3 个节点可渲染

### Commit 建议

```
feat(ui): mobile sidebar drawer and dashboard exam timeline
```

---

## Phase 6 — 合并与回归

### 前置

- [ ] 在 `explore/aceternity-surfaces` 完成 Phase 2–5 自选范围
- [ ] 用户 Review 通过（AGENTS.md：集中 Review 待办）

### 合并步骤

1. `git checkout master && git pull`
2. `git merge explore/aceternity-surfaces`（或 PR）
3. 解决 `styles.css` / `surfaces.css` 冲突
4. 全页手动走查：登录 → dashboard → resources → plan → qa → statistics → recommendations

### 文档更新

- `docs/HANDOFF.md` — Aceternity 移植摘要
- `docs/PROJECT_STATUS.md` — 标记 UI 升级完成度
- **不强制** 更新 `MASTER.md`（除非新增 token）

### 回归清单

| 场景 | 预期 |
|------|------|
| Session 登录 | Cookie 正常 |
| 资源列表筛选 | API 正常 |
| 批量删除资源 | checkbox 仍可用 |
| 计划生成 | POST `/api/plans/generate` |
| 答题提交 | POST `/api/answers` |
| 页面切换 | veil 动画 &lt; 500ms 感知 |

### Commit 建议

```
chore(docs): handoff aceternity surface migration
```

---

## Issue 拆分（ready-for-agent）

在 `.scratch/aceternity-explore/issues/` 创建：

| # | 文件 | 标签 | 范围 |
|---|------|------|------|
| 01 | `01-surface-baseline.md` | ready-for-agent | Phase 0 回顾 + 分支说明 |
| 02 | `02-global-surfaces.md` | ready-for-agent | Phase 2 |
| 03 | `03-cards-and-index.md` | ready-for-agent | Phase 3 |
| 04 | `04-auth-panels.md` | ready-for-agent | Phase 4 |
| 05 | `05-nav-stepper-timeline.md` | ready-for-human | Phase 5（交互多，建议人工验收） |

---

## 优先级建议（若时间紧）

**必做**（最大观感提升 / 已完成一半）：
- Phase 0 ✅
- Phase 2（KPI  strip + 表单）
- Phase 3 的 P-05/P-06（spotlight 扩展）

**应做**：
- Phase 4 认证 GridPattern（对比度已修，再加质感）
- Phase 3 R-07 index bento

**可选**：
- Phase 5 全包
- R-04 资源卡 author 布局
- R-06 FAQ

**不做**（审计 Defer）：
- 视频背景、Globe、infinite cards、暗色模式

---

## 成功定义

1. 用户主观评价：「不像通用 AI 仪表盘」
2. `MASTER.md` 色板与字体未偏离
3. 零 API 契约变更
4. `explore/aceternity-surfaces` 可演示、可合并
5. 本 AUDIT/PLAN 作为后续 Agent 接续的唯一入口

---

## 立即行动（推荐顺序）

1. **阅读** `AUDIT.md` §4 矩阵，确认 Defer 列表无异议
2. **执行 Phase 2**（全局 KPI strip — 改动小、全页收益）
3. **执行 Phase 3 P-05**（index spotlight — 5 分钟级）
4. 邀请用户 **集中 Review** 后再 Phase 4–5
5. 合并 `master`