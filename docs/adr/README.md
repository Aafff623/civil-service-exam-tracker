# 架构决策记录（ADR）

本目录用于存放**架构决策记录**（Architecture Decision Records）。

- 被 `docs/agents/domain.md` 与 `docs/agents/module-development-workflow.md` 引用：做模块开发前先查阅本目录中与改动相关的 ADR；若产出与既有 ADR 冲突，应显式标注而非静默覆盖。
- **当前为空** —— 本项目是课程设计，架构简单（Flask + MySQL + 原生前端），尚无需要单独建档的重大决策。已做的关键取舍记录在 `docs/PROJECT_STATUS.md` 的「关键决策」表里。
- 后续若出现非平凡的架构决策，在此新建 `ADR-NNNN-<标题>.md`，包含：背景、决策、备选方案、影响。
