# Week 2 调研摘要

## 本周目标

实现题库练习、智能学习计划、学习进度统计、弱项识别、个性化推荐、题目解析与答疑六大核心业务模块，完成从"有数据"到"有业务价值"的跨越。

## 实际完成内容

- **Day 6**：题库与练习模块 — 题目列表/筛选 API、答题提交与记录 API、前端题库练习页、单选/多选/判断交互、答题结果展示
- **Day 7**：智能学习计划模块 — 学习目标设置 API、计划生成算法（科目权重×难度+弱项加权）、学习计划页、每日任务卡片
- **Day 8**：学习进度跟踪模块 — 学习记录与进度统计 API、进度统计页、进度条/正确率图表可视化、打卡日历
- **Day 9**：弱项识别+个性化推荐模块 — 基于答题历史的弱项计算、个性化推荐 API 与页面、资源/题目推荐
- **Day 10**：解析与答疑模块 — 题目解析展示、答疑留言 API、Dashboard 接入评论提交

## 关键产出

- 200 道种子题入库并支持科目/资料来源/题型三级筛选
- 智能计划生成算法覆盖整个备考周期，自动划分三阶段（基础30%/强化40%/冲刺30%）
- 弱项识别规则：答题量≥5 且正确率<60%
- 推荐系统基于弱项科目自动推荐资源与同类题，含冷启动兜底
- 进度统计页含 KPI 看板、SVG 折线图、打卡日历、连续打卡统计
- Dashboard 接入计划、进度、推荐、弱项、考试倒计时数据

## 核心数据

- **代码提交**：Week 2 核心功能 commit 5 个（questions/plans/progress/recommendations/dashboard）
- **新增/修改文件**：
  - backend/routes/questions.py（题目列表/详情 API）
  - backend/routes/answers.py（答题提交/历史 API）
  - backend/routes/plans.py（计划生成算法）
  - backend/routes/progress.py（进度统计 API）
  - backend/routes/recommendations.py（推荐引擎）
  - backend/routes/comments.py（答疑留言 API）
  - frontend/qa.html / qa.js（题库练习页）
  - frontend/plan.html / plan.js（学习计划页）
  - frontend/statistics.html / statistics.js（统计页）
  - frontend/recommendations.html / recommendations.js（推荐页）
  - frontend/dashboard.html / dashboard.js（Dashboard）
- **关键指标**：
  - 题目总数：200 道（单选 152 / 判断 34 / 多选 14）
  - 科目覆盖：7 个（行测 5 子科目 + 申论 + 行测总科目）
  - 弱项阈值：答题量 ≥ 5、正确率 < 60%
  - 弱项加权：优先级 × 1.5
  - 每日任务数：max(2, min(5, daily_minutes // 30))
  - API Blueprint 新增：6 个（questions/answers/plans/progress/recommendations/comments）

## 亮点与难点

- **亮点**：
  - 多选答案规范化比对（排序去重，避免 "AC" 和 "CA" 被判错）
  - 弱项实时更新（每次答题后立即更新 weak_points 表）
  - 计划与进度联动（标记任务完成自动更新学习时长和完成项数）
  - 统计页 Demo 数据兜底（新用户无数据时展示演示数据）
- **难点/解决方案**：
  - 多选题型前端交互复杂 → 前后端统一 normalizeAnswer 函数
  - 计划生成覆盖旧计划 → 事务内先删后插
  - 进度统计跨表聚合 → 后端分多个查询聚合，前端统一渲染
  - 推荐系统冷启动 → 回退到通用入门推荐

## PPT 建议页数与标题

1. Week 2 总览：从数据到业务
2. 题库与练习模块：200 题的构建
3. 智能学习计划：算法驱动的个性化
4. 学习进度统计：可视化反馈闭环
5. 弱项识别与推荐：规则引擎实践
6. 题目解析与答疑：学习闭环的最后一环
7. Week 2 小结与 Week 3 展望
