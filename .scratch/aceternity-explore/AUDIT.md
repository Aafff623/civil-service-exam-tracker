# Aceternity 资产审计报告

> **项目**：公务员考试学习跟踪系统（civil-service-exam-tracker）  
> **资产来源**：`agentic-workbench/workbench/ui/aceternity`（Apache 2.0）  
> **审计日期**：2026-06-23  
> **当前实验分支**：`explore/aceternity-surfaces`（commit `b520115`）  
> **技术约束**：Flask + 原生 HTML/CSS/JS — **不引入 React / Tailwind / Framer Motion**

---

## 1. 审计目的

对照 Aceternity 资产库与本项目现有 UI，逐类判定：

| 策略 | 含义 |
|------|------|
| **移植 (Port)** | 仅提取视觉/交互模式，用 vanilla CSS + 轻量 JS 实现；**保留现有 DOM 结构与 API 绑定** |
| **替换 (Replace)** | 需要调整 HTML 结构或替换整块组件模式（仍可在 vanilla 栈完成） |
| **暂缓 (Defer)** | 强依赖 React 动画链、Canvas/WebGL、视频背景等；课程设计 ROI 低或栈不匹配 |
| **已完成 (Done)** | 已在 `explore/aceternity-surfaces` 落地 |

---

## 2. 资产库总览

### 2.1 Component Packs（`component-packs.7z` 解压）

| 分类 | 数量 | 技术特征 | 与本项目相关度 |
|------|------|----------|----------------|
| `sidebars/` | 2 | Framer Motion 展开/折叠、hover 宽侧边栏 | ★★★★★ |
| `stats-sections/` | 4 | KPI 网格、GridPattern 背景、渐变容器 | ★★★★★ |
| `cards/` | 4 | Spotlight、骨架动画、背景图 hover | ★★★★☆ |
| `login-and-signup/` | 2 | 双栏登录、GridLine 装饰、testimonial | ★★★★☆ |
| `bento-grids/` | 3 | 不规则网格 + Motion 骨架 | ★★★☆☆ |
| `navbars/` | 2 | 顶栏、移动端抽屉 | ★★☆☆☆ |
| `backgrounds/` | 7 | 视频/WebGL/渐变全屏背景 | ★☆☆☆☆ |
| `hero/` | 8 | 营销落地页主视觉 | ★☆☆☆☆ |
| `feature-sections/` | 4 | 功能介绍区块 | ★☆☆☆☆ |
| `cta-sections/` | 3 | 号召行动条 | ★☆☆☆☆ |
| `pricing-sections/` | 3 | 定价卡片 | — |
| `testimonials/` | 3 | 用户评价轮播 | — |
| `footers/` | 3 | 页脚 | — |
| `logo-clouds/` | 3 | Logo 墙 + spotlight | — |
| `blog-sections/` | 2 | 博客列表 | — |
| `blog-content-sections/` | — | 文章排版 | — |
| `contact-sections/` | 2 | 联系表单 | — |
| `faq/` | 3 | 折叠 FAQ | ★★☆☆☆ |

**合计**：约 53 个独立 block（showcase 登记 18 类 / 60 项，含模板内组件）。

### 2.2 完整模板（8 套）

| 模板 | 类型 | 可借鉴点 |
|------|------|----------|
| `saas-template` | AI SaaS | 仪表盘骨架、feature grid、`grid-lines` |
| `proactiv` | 营销 | `grid-pattern` 装饰 |
| `foxtrot` | 营销 | 登录页 `GridPattern`、Hero |
| `agency` | 机构站 | 服务卡片 + GridPattern |
| `startup-landing` | 落地页 | 简洁 hero |
| `playful` / `devpro` / `sidefolio` | 作品集 | 与本项目弱相关 |

**结论**：对本项目最有参考价值的是 **saas-template 的 app shell 感** + **component-packs 中的 sidebars / stats / cards / login**。

### 2.3 Showcase 参考

- 路径：`agentic-workbench/outputs/ui-blocks/aceternity-showcase/`
- 用途：视觉验收、挑选 block 编号（如 `stats-sections/2`）
- **不迁入** exam-tracker 仓库（仅作对照）

---

## 3. 本项目 UI 清单（对照基线）

| 区域 | 选择器 / 文件 | 页面 |
|------|---------------|------|
| App Shell | `.app`, `.sidebar`, `.main`, `.topbar` | 全部工作台页 |
| 导航 | `.nav a`, `.nav-icon`, `.logo` | 全部 |
| KPI 条 | `.kpi`, `.grid-4`, `.grid-5` | dashboard, statistics |
| 卡片 | `.card`, `.card.soft`, `.card-title` | 全站 |
| 按钮 / Tab | `.btn`, `.tab`, `.tabs` | 全站 |
| 资源卡 | `.resource-card` | resources, app.js 动态渲染 |
| 推荐卡 | `.reco-card` | recommendations |
| 认证 | `.auth-page`, `auth.css` | login, register |
| 计划 | `.stepper`, `.plan-stat-card`, `.task-item` | plan |
| 统计图 | `.mini-chart`, `.bar-list`, `.calendar` | statistics |
| 热力图 | `.heatmap` | dashboard |
| 倒计时 | `.countdown-card`, `.countdown-milestones` | dashboard |
| 题库 | `.qa-*`（选项、解析区） | qa |
| 过渡 | `ui.js` veil / shell reveal | app.js |

**设计系统**：`design-system/公务员考试学习跟踪系统/MASTER.md` — navy `#0F172A` + sky `#0369A1`，Lexend + Source Sans 3，政府/可信气质。

---

## 4. 移植 vs 替换 矩阵

### 4.1 已完成（`surfaces.css` + `ui.js`，分支 `explore/aceternity-surfaces`）

| Aceternity 参考 | 本项目落点 | 策略 | 状态 |
|-----------------|------------|------|------|
| `sidebars/1` — 灰底 + 白主区 inset | `.main` margin/border/radius | Port | ✅ Done |
| `sidebars/1` — nav active 竖条 + 浅底 | `.nav a.active::before` | Port | ✅ Done |
| `stats-sections/3` — 中性 KPI 面 | `.kpi` 去彩虹渐变 | Port | ✅ Done |
| `cards/*` — hover radial glow | `.surface-spotlight` + `initSurfaceSpotlight()` | Port | ✅ Done（仅 resource/reco） |
| SaaS CTA — 渐变主按钮 | `.btn.primary` gradient + beam | Port | ✅ Done |
| Segmented control | `.tabs` / `.tab.active` | Port | ✅ Done |
| 通用卡片 elevation | `.card`, `.resource-card`, `.reco-card` | Port | ✅ Done |

### 4.2 建议移植（Phase 2–4，不改 API）

| ID | Aceternity 来源 | 对标本项目 | 策略 | 工作量 | 说明 |
|----|-----------------|------------|------|--------|------|
| P-01 | `stats-sections/2` GridPattern | `.kpi` 区背景 | Port | S | SVG/CSS 网格底纹，静态即可 |
| P-02 | `stats-sections/2` 图标+数值横排 | `.kpi` 结构 | Replace | M | 增加可选 `.kpi-icon` 槽位（emoji→SVG） |
| P-03 | `foxtrot/GridPattern` | `auth-brand` 右侧 | Port | S | 替换纯 scrim，保留双栏布局 |
| P-04 | `login-and-signup/1` GridLine | `auth-form-panel` 装饰线 | Port | S | 纯 CSS 伪元素 |
| P-05 | `cards/1` 细边框 glow | `.card.module-link`（index） | Port | S | 加 `surface-spotlight` class |
| P-06 | Spotlight 扩展 | `.plan-stat-card`, dashboard 弱项卡 | Port | S | 复用现有 JS |
| P-07 | `stats-sections/2` 分隔 KPI 条 | `.grid-4` 统一外框 | Port | M | 单容器 `border` + 内部分隔线 |
| P-08 | `saas/grid-lines` | `.topbar` 底部分隔 | Port | S | 极淡网格线 |
| P-09 | 输入框 focus ring | `.input`, `.select` | Port | S | 对齐 MASTER ring token |
| P-10 | `bento-grids/1` 视觉节奏 | dashboard 第二行 grid | Port | M | 仅 CSS `grid-row-span`，不改数据 |

### 4.3 建议替换（需改 HTML，Phase 3–5）

| ID | Aceternity 来源 | 对标本项目 | 策略 | 工作量 | 说明 |
|----|-----------------|------------|------|--------|------|
| R-01 | `sidebars/1` 折叠侧栏 | `.sidebar` 移动端 | Replace | M | 加汉堡按钮 + `sidebar-collapsed`；无 Motion 用 CSS transition |
| R-02 | `stats-sections/1` 时间轴 | dashboard「考试时间线」 | Replace | L | 静态时间线改为竖向 stepper（现多为占位数据） |
| R-03 | `login-and-signup/1` testimonial 列 | `auth-brand` 文案区 | Replace | M | 结构改为 quote + avatar 列（可用静态文案） |
| R-04 | `cards/4` author 卡 | `resource-card` 列表项 | Replace | M | 缩略图+标题+元信息横排（与现有 API 字段对齐） |
| R-05 | `stepper` 视觉 | `plan.html` `.stepper` | Replace | S | 对齐 Aceternity 圆点连线样式 |
| R-06 | `faq/1` 手风琴 | `qa.html` 答疑/帮助 | Replace | M | 可选折叠「使用说明」区块 |
| R-07 | index 模块入口 | `index.html` `.module-link` | Replace | M | Bento 式不规则网格（HTML grid-area 调整） |

### 4.4 建议暂缓（不进入本阶段）

| ID | Aceternity 来源 | 原因 |
|----|-----------------|------|
| D-01 | `backgrounds/*` 视频/WebGL 全屏背景 | 与政府风 MASTER 冲突；性能与 a11y 差 |
| D-02 | `cards/1` Framer 骨架动画 | 需 React + motion；演示价值有限 |
| D-03 | `cards/3` GIF 背景 hover | 不适合备考工具气质 |
| D-04 | `bento-grids/*` Motion 骨架 | 动画链难用 vanilla 复刻 |
| D-05 | `hero/*`, `cta-sections`, `pricing` | 营销落地页，非工作台 |
| D-06 | `logo-clouds/3` SpotlightLogoCloud | 品牌墙场景不存在 |
| D-07 | `navbars/*` 顶栏替换 | 已有 sidebar 主导航；双导航冗余 |
| D-08 | `testimonials` 无限滚动 | 无用户评价数据源 |
| D-09 | saas `globe` / `infinite-moving-cards` | 重动画 + 无业务映射 |
| D-10 | 暗色模式全套 | MASTER 未定义 dark theme；范围外 |

---

## 5. 页面级映射

| 页面 | 当前痛点（用户反馈） | 优先 Aceternity 资产 | 策略 |
|------|----------------------|----------------------|------|
| **全局 Shell** | 模板感、彩虹 KPI | `sidebars/1`, shell inset | Port ✅ + P-07/P-08 |
| **dashboard** | KPI 花哨、倒计时块重 | `stats-sections/2/3`, `bento` 节奏 | Port P-01/P-10 |
| **resources** | 卡片平庸 | `cards` spotlight, `cards/4` 布局 | Port ✅ + R-04 |
| **recommendations** | 同上 | spotlight | Port ✅ |
| **plan** | stepper 简陋 | custom stepper, `stats` 子卡 | Replace R-05, Port P-06 |
| **statistics** | 5 列 KPI 过艳 | `stats-sections/2` 统一外框 | Port P-07（surfaces 已弱化单色） |
| **qa** | 偏表单感 | `faq` 手风琴（帮助区） | Replace R-06（可选） |
| **login/register** | 左侧对比度曾有问题 | `foxtrot GridPattern`, `login/1` | Port P-03/P-04, Replace R-03 |
| **index** | 模块卡 AI 感 | `bento` + spotlight | Port P-05, Replace R-07 |
| **resource-detail** | 头图过大（已修） | 轻 card border | Port（surfaces 已部分覆盖） |

---

## 6. 技术移植原则（vanilla 栈）

1. **Token 优先**：Aceternity 的 neutral/sky 映射到 `--color-*` / `--shell-*`，不引入 Tailwind 色板。
2. **动画克制**：仅 `transform` / `opacity` / CSS `gradient`；spotlight 用 `mousemove` + CSS 变量（已实现）。
3. **GridPattern**：优先内联 SVG `<pattern>` 或 `background-image` 重复，避免 JS 画布。
4. **不拆页**：每页继续 `*.html` + `js/*.js`；禁止为 Aceternity 上 React。
5. **许可证**：沿用 Apache 2.0；若发布衍生 UI 块，保留 NOTICE（课程设计内部演示可简记于 `docs/`）。

---

## 7. 与 MASTER.md 对齐检查

| Aceternity 默认 | MASTER 要求 | 处理 |
|-----------------|-------------|------|
| neutral-900 暗色 | 浅色政府风 | 仅用浅色 token |
| 彩虹渐变 KPI | 高对比 navy+sky | surfaces.css 已中和 ✅ |
| 大圆角 24px+ | 8–16px | 使用 `--radius-shell: 16px` ✅ |
| Inter/Geist 字体 | Lexend + Source Sans 3 | **不替换字体** |
| 装饰性 motion | 可信、克制 | Defer 重动画 |

---

## 8. 风险与依赖

| 风险 | 缓解 |
|------|------|
| `surfaces.css` 与 `styles.css` 双处定义冲突 | surfaces 仅做 override；合并 master 前做一次 cascade 审查 |
| 移动端 `.main` margin 挤压 | 已有 `@media (max-width: 860px)` 归零 ✅ |
| spotlight 性能 | 仅绑定交互卡，非全站 `.card` |
| 替换 R-04 resource 卡影响批量选择 | 保留 `.resource-batch-check` DOM 位置契约 |

---

## 9. 审计结论

- **可移植（高 ROI）**：约 **10 项**（P-01–P-10），以 CSS/轻 JS 为主，**不破坏 API**。
- **可替换（中 ROI）**：约 **7 项**（R-01–R-07），需 HTML 调整但仍在 vanilla 栈。
- **应暂缓**：约 **10 项**（D-01–D-10），React/营销/重动画。
- **已完成**：**7 项**核心 shell/表面模式（`b520115`），覆盖全局气质但未覆盖认证、index、时间线、移动端侧栏。

**下一步**：见同目录 `PLAN.md` 分阶段实施与验收标准。