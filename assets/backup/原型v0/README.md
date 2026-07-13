# 公务员考试学习跟踪系统 - 前端静态原型

这是根据方案 A 效果图制作的纯静态 HTML/CSS/JS 原型。

## 页面

- `overview.html`：项目总览入口
- `index.html`：首页 / 学习总览 Dashboard
- `resources.html`：考试信息与资源管理
- `plan.html`：智能学习计划生成
- `recommendations.html`：个性化学习推荐
- `statistics.html`：学习进度跟踪与统计分析
- `qa.html`：智能题目解析与答疑

## 使用方式

直接双击 `overview.html` 或 `index.html` 即可预览。

也可以在当前目录运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/overview.html`。

## 说明

- 无需安装依赖。
- 所有数据均为演示数据。
- 后续可改造成 Vue / React / Next.js。
