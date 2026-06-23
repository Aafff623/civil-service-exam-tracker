# Frontend Design Contract

> 公务员考试学习跟踪系统 · 工作台 UI 规范  
> 来源：`design-system/公务员考试学习跟踪系统/MASTER.md` + Taste-Skill 审计（VARIANCE 4 / MOTION 5 / DENSITY 6）

## Design Read

公考学习 **数据型 Dashboard**（教育工具），面向学生与答辩评委。语言：**可信、克制、政务/教育专业感**。对齐深藏青 + 单一强调蓝，**避免**亮蓝 SaaS、玻璃拟态、彩虹标签、emoji 导航。

## Token Map（CSS 变量）

| 语义 | 变量 | 值 |
|------|------|-----|
| 品牌主色 | `--color-primary` | `#0F172A` |
| 主色上的文字 | `--color-on-primary` | `#FFFFFF` |
| 次要文字 | `--color-secondary` | `#334155` |
| 强调 / CTA | `--color-accent` | `#0369A1` |
| 强调 hover | `--color-accent-hover` | `#075985` |
| 页面背景 | `--color-background` | `#F8FAFC` |
| 前景文字 | `--color-foreground` | `#020617` |
| 弱化背景 | `--color-muted-bg` | `#E8ECF1` |
| 边框 | `--color-border` | `#E2E8F0` |
| 危险 | `--color-destructive` | `#DC2626` |
| 焦点环 | `--color-ring` | `#0F172A` |

### 间距

`--space-xs` 4px · `--space-sm` 8px · `--space-md` 16px · `--space-lg` 24px · `--space-xl` 32px · `--space-2xl` 48px · `--space-3xl` 64px

### 阴影（轻量，禁止彩色 glow）

- `--shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)`
- `--shadow-md`: `0 4px 6px rgba(0,0,0,0.08)`
- `--shadow-lg`: `0 10px 15px rgba(0,0,0,0.08)`

### 圆角

- 卡片 / 面板：`12px`（`--radius`）
- 输入 / 小控件：`8px`（`--radius-sm`）
- 按钮：主按钮 `8px`，导航项 `10px`

### 字体

- 标题：`Lexend`（`--font-heading`）
- 正文：`Source Sans 3`（`--font-body`）
- 数据：可用等宽，非必须

```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');
```

## 组件约定

| 组件 | 规则 |
|------|------|
| 侧栏 | 实色白底，`1px` 右边框，**不用** `backdrop-filter` |
| 导航激活 | 实色 `--color-accent`，无渐变、无彩色阴影 |
| 主按钮 | `--color-accent` 填充，hover `--color-accent-hover` |
| 卡片 | 白底 + `--color-border` + `--shadow-sm` |
| 标签 | 最多 2 种语义色（状态 + 中性灰），禁止彩虹 tag |
| 输入 focus | `border-color: --color-accent` + `box-shadow: 0 0 0 3px rgba(3,105,161,0.12)` |

## 反 Slop 清单（Taste-Skill 节选）

- 禁止：亮蓝 radial 背景、紫/青点缀、`linear-gradient` 主按钮、emoji 图标、页脚暴露技术栈
- 禁止：每页渐变数字 `title-badge`、假搜索 + 无功能通知
- 文案：工作台语气，无「同学 👋」、无「静态原型」自述
- 对比度：正文 WCAG AA 4.5:1；焦点环可见

## 动效（Phase 4 预备）

### GSAP 加载（按需页面引入）

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

入口脚本：`frontend/js/motion.js`（待 Phase 4 实现）

| 场景 | 方案 | 时长 |
|------|------|------|
| 首屏 KPI | `timeline` stagger | 200–350ms |
| 页内切换 | `opacity` + `y: 8` | 200ms |
| 数字 KPI | count-up | 400ms |
| 任务勾选排序 | Flip plugin | 300ms |

**原则：** 尊重 `prefers-reduced-motion`；只动 `transform` / `opacity`（进度条 width 例外）。

## 文件职责

| 文件 | 职责 |
|------|------|
| `assets/styles.css` | 全局 token + 工作台组件 |
| `assets/auth.css` | 登录/注册（继承 token，不另起色系） |
| `design-system/.../MASTER.md` | Token 权威来源（只读参考） |

## 阶段验收

- **Phase 1：** 任意两页色温一致，无亮蓝 glow，字体为 Lexend + Source Sans 3
- **Phase 2：** 侧栏 SVG、无 emoji、无技术栈页脚
- **Phase 4：** Dashboard 加载有层次，任务 Flip 顺滑