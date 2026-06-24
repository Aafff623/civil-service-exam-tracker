# PPT 制作规划 — 公务员考试学习跟踪系统答辩汇报

> 本规划基于 `.scratch/ppt-research/week1~3/` 的调研报告，明确答辩 PPT 的目标、结构、素材来源和制作流程。后续使用 `ppt-master` skill 按此规划生成最终 `.pptx`。

---

## 一、PPT 定位

| 项目 | 说明 |
|------|------|
| **受众** | 课程设计答辩老师 / 学期项目评审 |
| **场景** | 课堂答辩，限时 8-10 分钟讲解 |
| **目标** | 展示「从 0 到 1」的三周开发过程、核心模块实现、最终可运行成果 |
| **风格** | 简洁、数据驱动、图文结合、突出过程与问题解决 |
| **数据来源** | `.scratch/ppt-research/weekN/REPORT.md` + `docs/DEVELOPMENT_TIMELINE.md` + 项目源码 |

## 二、已确认制作参数

| 参数 | 选定值 |
|------|--------|
| **布局模板** | `academic_defense`（学术答辩模板） |
| **画布格式** | PPT 16:9（1280×720） |
| **项目路径** | `C:\Users\Lenovo\.claude\skills\ppt-master\projects\civil_service_defense_ppt169_20260624` |
| **源文件** | `.scratch/ppt-research/SOURCE_ALL.md`（Week 1-3 REPORT 合集） |
| **模板文件** | 已复制 `templates/academic_defense/` |
| **输出目标** | `assets/ppt/公务员考试学习跟踪系统答辩.pptx` + `.pdf` |

---

## 二、PPT 结构（建议 18-20 页）

```
1.  封面
2.  目录 / 汇报提纲
3.  项目背景与目标
4.  技术选型与架构（Week 1）
5.  数据库设计（Week 1）
6.  用户与资源模块（Week 1）
7.  Week 1 小结
8.  题库与练习模块（Week 2）
9.  智能学习计划算法（Week 2）
10. 进度统计与可视化（Week 2）
11. 弱项识别与个性化推荐（Week 2）
12. 题目解析与答疑（Week 2）
13. Week 2 小结
14. UI/UX 统一与动画交互（Week 3）
15. 测试、Review 与演示数据准备（Week 3）
16. 文档整理与项目归档（Week 3）
17. 最终成果与核心数据
18. 系统演示截图 / GIF
19. 后续计划与不足
20. 致谢 / Q&A
```

---

## 三、每页内容来源映射

| 页码 | 页面标题 | 主要素材来源 |
|------|----------|--------------|
| 1 | 封面 | 项目名称、README.md、DEVELOPMENT_TIMELINE.md |
| 2 | 目录 | 本规划第二节 |
| 3 | 项目背景 | PRD、PROJECT_GUIDE.md、week1 REPORT.md |
| 4 | 技术选型与架构 | week1 REPORT.md、PRD 7.3 Technology、CONTEXT.md |
| 5 | 数据库设计 | week1 REPORT.md、backend/init_db.sql |
| 6 | 用户与资源模块 | week1 REPORT.md、auth.py、resources.py |
| 7 | Week 1 小结 | week1 SUMMARY.md、KEY_POINTS.md |
| 8 | 题库与练习 | week2 REPORT.md、questions.py、qa.js、init_db.sql |
| 9 | 学习计划算法 | week2 REPORT.md、plans.py |
| 10 | 进度统计 | week2 REPORT.md、progress.py、statistics.js |
| 11 | 弱项识别与推荐 | week2 REPORT.md、recommendations.py |
| 12 | 解析与答疑 | week2 REPORT.md、comments.py |
| 13 | Week 2 小结 | week2 SUMMARY.md、KEY_POINTS.md |
| 14 | UI/UX 与动画 | week3 REPORT.md、surfaces.css、ui.js、motion.js |
| 15 | 测试与演示数据 | week3 REPORT.md、test_api.ps1、init_db.sql |
| 16 | 文档整理 | week3 REPORT.md、README.md、PROJECT_GUIDE.md |
| 17 | 最终成果 | week3 SUMMARY.md、DEVELOPMENT_TIMELINE.md「用于 PPT 的关键数据」 |
| 18 | 演示截图 | week1~3 SCREENSHOTS.md、实际运行界面 |
| 19 | 后续计划 | DEVELOPMENT_TIMELINE.md「后续计划」、PROJECT_STATUS.md |
| 20 | 致谢 | 固定页 |

---

## 四、设计规范

- **主色调**：沿用项目设计系统（Aceternity 风格），深蓝 / 紫色渐变背景，白色/浅灰文字
- **字体**：中文用微软雅黑或思源黑体，英文/代码用 Consolas / JetBrains Mono
- **图表**：架构图、ER 图、算法流程图、模块依赖图、时间线甘特图
- **截图**：登录页、Dashboard、资源详情、题库练习、统计页、推荐页、个人资料页
- **动画**：PPT 内使用简洁切换，不要过度动画；重点数据可用进入动画

---

## 五、制作流程

1. **素材复核**：确认 week1~3 REPORT.md 中的数据、代码引用、截图建议准确
2. **大纲定稿**：按本规划第二节确定 20 页结构
3. **逐页文案**：从 REPORT.md 提取每页标题 + bullet points + 关键数据
4. **图表/截图准备**：按 SCREENSHOTS.md 截取或绘制示意图
5. **ppt-master 生成**：调用 skill，输入大纲 + 文案 + 素材路径
6. **人工 Review**：检查数据一致性、错别字、排版、截图清晰度
7. **导出备份**：生成 `.pptx` 和 PDF 双版本，存入 `assets/ppt/`

---

## 六、输出物

| 输出物 | 路径 | 说明 |
|--------|------|------|
| PPT 源文件 | `assets/ppt/公务员考试学习跟踪系统答辩.pptx` | 原生可编辑形状版 |
| 兼容版 PPT | `assets/ppt/公务员考试学习跟踪系统答辩_兼容版.pptx` | Office 兼容模式（PNG+SVG） |
| PDF 版本 | `assets/ppt/公务员考试学习跟踪系统答辩.pdf` | 需从 PPT 另存为 PDF（待补充） |
| ppt-master 项目 | `C:\Users\Lenovo\.claude\skills\ppt-master\projects\civil_service_defense_ppt169_20260624` | 含 design_spec、SVG、讲稿 |
| 制作清单 | `docs/PPT_CHECKLIST.md` | 本规划的配套 checklist |

---

## 七、当前状态

- ✅ PPT 初稿已生成（18 页）
- ✅ 8 张系统运行截图已截取并嵌入 PPT
  - 登录页 → Slide 03
  - 资源库 → Slide 06
  - 题库练习 → Slide 08
  - 学习计划 → Slide 09
  - 学习统计 → Slide 10
  - 学习推荐 → Slide 11
  - Dashboard → Slide 14
  - 个人资料 → Slide 17
- ⬜ 需导出 PDF 备份（当前环境无 LibreOffice / PowerPoint COM，需手动操作）
- ⬜ 需在答辩机上实测打开效果


## 七、注意事项

- 所有数字必须能从 `git log`、`init_db.sql`、文档中二次核实
- 不要直接粘贴大段代码到 PPT，只保留关键片段和伪代码流程
- 每页 bullet 不超过 5 条，每条不超过两行
- 截图需用实际运行界面，避免使用旧原型或设计稿
