# 02 — 全局表面补齐（Phase 2）

**标签**：`ready-for-agent`  
**审计 ID**：P-01, P-07, P-08, P-09  
**参考**：`.scratch/aceternity-explore/PLAN.md` Phase 2

## Goal

KPI 统计带统一外框 + 网格底纹；topbar 细线；表单 focus ring。

## Tasks

1. `surfaces.css`：`.kpi-strip` 容器样式 + GridPattern 背景
2. `dashboard.html` / `statistics.html`：KPI section 外包 `.kpi-strip`（轻量 HTML）
3. `.topbar::after` 装饰线
4. `.input:focus`, `.select:focus` ring

## Acceptance criteria

- [ ] KPI 区视觉为一条统计带，列间分隔线清晰
- [ ] 网格底纹 opacity ≤ 0.4
- [ ] 键盘 Tab 到表单可见 focus
- [ ] 无 API / JS 逻辑变更

## Source blocks

- `stats-sections/2.tsx`
- `saas-template/components/grid-lines.tsx`