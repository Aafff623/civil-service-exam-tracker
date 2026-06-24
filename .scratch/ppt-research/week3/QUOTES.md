# Week 3 可直接引用的文档原文与代码片段

## 1. 设计系统 Token（surfaces.css）

```css
:root {
  --shell-bg: #eef2f6;
  --shell-border: rgba(15, 23, 42, 0.08);
  --surface-elevated: #ffffff;
  --surface-muted: #f8fafc;
  --radius-shell: 16px;
  --beam-sky: rgba(3, 105, 161, 0.55);
}
```
来源：`frontend/assets/surfaces.css` 行 1-12

## 2. Spotlight 悬停光效（surfaces.css）

```css
.surface-spotlight::before {
  opacity: 0;
  transition: opacity 0.25s ease;
  background: radial-gradient(
    420px circle at var(--spot-x) var(--spot-y),
    rgba(3, 105, 161, 0.09),
    transparent 42%
  );
}
.surface-spotlight:hover::before { opacity: 1; }
```
来源：`frontend/assets/surfaces.css` 行 199-239

## 3. 加载 Veil（ui.js）

```javascript
function showPageVeil(message = '正在加载中') {
    veil.innerHTML = `
        <div class="app-veil-backdrop"></div>
        <div class="app-veil-shimmer"></div>
        <div class="app-veil-inner">
            <div class="app-veil-spinner"><span></span><span></span><span></span></div>
            <span class="app-veil-text">${escapeHtml(message)}</span>
            <div class="app-veil-progress"><span></span></div>
        </div>`;
}
```
来源：`frontend/js/ui.js` 行 58-79

## 4. GSAP KPI 数字动画（motion.js）

```javascript
function animateCount(el, endValue, suffix, decimals) {
    const obj = { val: 0 };
    gsap.to(obj, {
        val: endValue,
        duration: 0.45,
        ease: 'power2.out',
        onUpdate: () => {
            el.innerHTML = formatKpiValue(obj.val, suffix, decimals);
        }
    });
}
```
来源：`frontend/js/motion.js` 行 18-32

## 5. FLIP 任务勾选动画（motion.js）

```javascript
playTaskFlip(list, state) {
    Flip.from(state, {
        duration: 0.32,
        ease: 'power2.inOut',
        absolute: true,
        nested: true
    });
}
```
来源：`frontend/js/motion.js` 行 176-186

## 6. PowerShell 冒烟测试（test_api.ps1）

```powershell
Test-Api -Name 'health' -Path '/health'
Test-Api -Name 'login root' -Method POST -Path '/auth/login' -Body @{ username = 'root'; password = '123456' }
Test-Api -Name 'resources list' -Path '/resources/'
Test-Api -Name 'questions list' -Path '/questions/'
Test-Api -Name 'submit answer' -Method POST -Path '/answers/' -Body @{ question_id = $qId; selected_answer = $correct }
```
来源：`backend/test_api.ps1` 行 60-99

## 7. 题库数据规模（init_db.sql）

```sql
-- 200 道题，覆盖单选/多选/判断
-- 单选 152 题、多选 14 题、判断 34 题
INSERT INTO questions (subject_id, resource_id, type, content, options, correct_answer, explanation, tips) VALUES
(1, 3, '单选', '党的二十大报告指出...', '...', 'B', '解析：...', '政治理论 · 第 3 题'),
```
来源：`frontend/assets/init_db.sql` 行 244 起

## 8. 前端设计 Review 结论

> "当前前端功能完整，但视觉表达偏模板化。建议优先做 P0/P1 改动：统一色彩、优化表单反馈、整理资源库布局、增加移动端适配。这些改动代码量小，但能让整个系统看起来更像一个用心的课程设计作品。"

来源：`docs/frontend-design-review.md` 行 193

## 9. 模块加载时序修复（commit 79e7749）

```javascript
// 引入 app:ready 事件机制，defer 直到所有模块脚本注册完成
document.body.classList.add('app-pending');
// 模块脚本加载完成后触发
window.dispatchEvent(new Event('app:ready'));
```
来源：`frontend/js/ui.js` 行 96-123

## 10. 本地时区过滤修复（commit 4191556）

```javascript
function formatHeatmapDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const dt = new Date(y, m - 1, d);  // 使用本地时区
    return `${y}年${m}月${d}日 · 周${weekdays[dt.getDay()]}`;
}
```
来源：`frontend/js/ui.js` 行 278-283
