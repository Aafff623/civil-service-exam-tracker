# 01 — Aceternity 表面基线（Phase 0）

**标签**：`ready-for-agent`  
**分支**：`explore/aceternity-surfaces`  
**参考**：`.scratch/aceternity-explore/AUDIT.md` §4.1

## Goal

确认 Phase 0 已落地项在 8 个工作台页面表现一致，作为后续 Phase 2+ 的基线。

## 已完成

- `frontend/assets/surfaces.css`
- `frontend/js/ui.js` → `initSurfaceSpotlight()`
- resource / reco 卡 `surface-spotlight`

## Acceptance criteria

- [ ] `explore/aceternity-surfaces` 上 `npm` 无需；`cd frontend && python -m http.server 8080` 可访问
- [ ] dashboard / statistics KPI 无彩虹渐变顶边
- [ ] `.main` 白 inset 面板在桌面可见
- [ ] resources 卡 hover 有径向光斑
- [ ] `master` 未包含 surfaces 时，文档注明需切分支演示

## Notes

合并前勿在 `master` 直接改 surfaces。