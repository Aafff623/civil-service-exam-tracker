function todayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((target - now) / 86400000));
}

function daysBetween(startStr, endStr) {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function renderTodayTasks(items) {
    const list = document.getElementById('dashboard-tasks');
    if (!list) return;

    if (!items.length) {
        list.innerHTML = '<p class="muted">今日暂无计划任务，<a class="link" href="plan.html">去生成计划</a></p>';
        return;
    }

    list.innerHTML = items.map((item, idx) => {
        const done = item.is_completed;
        const tagClass = done ? 'green' : (idx === 0 ? 'orange' : 'gray');
        const tagText = done ? '完成' : (idx === 0 ? '重点' : '待完成');
        return `
            <div class="task-item">
                <span class="task-check ${done ? 'done' : ''}">${done ? '✓' : idx + 1}</span>
                <div class="task-text">
                    <strong>${escapeHtml(item.subject_name)} · ${escapeHtml(item.content.slice(0, 12))}</strong>
                    <span>${item.suggested_minutes} 分钟 · ${done ? '已完成' : '待完成'}</span>
                </div>
                <span class="tag ${tagClass}">${tagText}</span>
            </div>
        `;
    }).join('');
}

function weakLevel(accuracy) {
    if (accuracy < 50) return { label: '薄弱', class: 'red' };
    if (accuracy < 70) return { label: '待提升', class: 'orange' };
    return { label: '稳定', class: 'green' };
}

function renderWeakBars(weakSubjects) {
    const container = document.getElementById('dashboard-weak-bars');
    const tip = document.getElementById('dashboard-weak-tip');
    const summary = document.getElementById('dashboard-weak-summary');
    const actions = document.getElementById('dashboard-weak-actions');
    const badge = document.getElementById('dashboard-weak-badge');
    if (!container) return;

    if (!weakSubjects.length) {
        container.innerHTML = '<p class="muted">完成练习后将显示弱项分析</p>';
        if (summary) summary.innerHTML = '';
        if (actions) actions.innerHTML = '<a class="btn ghost small" href="qa.html">去做题</a>';
        if (badge) badge.textContent = '待分析';
        if (tip) tip.textContent = '📘 建议先去题库完成几道练习题。';
        return;
    }

    const top = weakSubjects[0];
    const avg = Math.round(
        weakSubjects.reduce((s, w) => s + w.accuracy, 0) / weakSubjects.length
    );

    if (badge) badge.textContent = `${weakSubjects.length} 项弱项`;
    if (summary) {
        summary.innerHTML = `
            <div class="weak-stat"><span>平均正确率</span><strong>${avg}%</strong></div>
            <div class="weak-stat"><span>最需加强</span><strong>${escapeHtml(top.subject_name)}</strong></div>
        `;
    }

    container.innerHTML = weakSubjects.slice(0, 3).map((w, i) => {
        const lv = weakLevel(w.accuracy);
        return `
            <div class="bar-row rich">
                <div class="weak-rank">#${i + 1}</div>
                <div class="weak-info">
                    <span class="weak-name">${escapeHtml(w.subject_name)}</span>
                    <span class="weak-meta">${w.total_answers || 0} 题 · <span class="tag ${lv.class}">${lv.label}</span></span>
                </div>
                <div class="progress orange"><span style="width:${Math.round(w.accuracy)}%"></span></div>
                <strong>${Math.round(w.accuracy)}%</strong>
            </div>
        `;
    }).join('');

    if (actions) {
        actions.innerHTML = `
            <a class="btn primary small" href="qa.html?subject_id=${top.subject_id}">练习 ${escapeHtml(top.subject_name.slice(0, 4))}</a>
            <a class="btn ghost small" href="recommendations.html">查看推荐</a>
            <a class="btn ghost small" href="resources.html">找资料</a>
        `;
    }

    if (tip) {
        tip.innerHTML = `📘 建议今天优先加强「<strong>${escapeHtml(top.subject_name)}</strong>」，正确率 ${Math.round(top.accuracy)}%，再练 5 题可见明显提升。`;
    }
}

function renderHeatmap(dailyMinutes) {
    renderStudyHeatmap(document.getElementById('dashboard-heatmap'), dailyMinutes, { weeks: 12 });
}

function updateProgressRing(rate) {
    const text = document.getElementById('dashboard-progress-text');
    const ring = document.getElementById('dashboard-progress-ring');
    const desc = document.getElementById('dashboard-progress-desc');
    const pct = Math.round(rate || 0);

    if (text) text.textContent = `${pct}%`;
    if (ring) {
        const circumference = 283;
        ring.setAttribute('stroke-dashoffset', String(circumference * (1 - pct / 100)));
    }
    if (desc) desc.textContent = `当前计划完成率 ${pct}%，坚持完成每日任务可稳步提升。`;
}

function renderCountdown(goal, planRate) {
    if (!goal) return;

    const days = daysUntil(goal.exam_date);
    const totalPrep = daysBetween(goal.start_date, goal.exam_date);
    const elapsed = Math.max(0, totalPrep - (days || 0));
    const prepPct = totalPrep ? Math.min(100, Math.round((elapsed / totalPrep) * 100)) : 0;

    const countdown = document.getElementById('dashboard-countdown-days');
    if (countdown && days !== null) {
        const urgency = days <= 30 ? 'urgent' : days <= 90 ? 'soon' : '';
        countdown.className = `num ${urgency}`;
        countdown.innerHTML = `${days}<small>天</small>`;
    }

    const typeTag = document.getElementById('dashboard-exam-type-tag');
    if (typeTag) typeTag.textContent = goal.exam_type || '国考';

    const examDate = document.getElementById('dashboard-exam-date');
    if (examDate) examDate.textContent = `目标考试日 ${goal.exam_date}`;

    const sub = document.getElementById('dashboard-countdown-sub');
    if (sub) {
        const weeks = Math.floor((days || 0) / 7);
        sub.textContent = days === 0
            ? '今天就是考试日，加油！'
            : `约 ${weeks} 周 · 每日 ${goal.daily_minutes || 120} 分钟`;
    }

    const milestones = document.getElementById('dashboard-milestones');
    if (milestones) {
        const items = [
            { label: '备考起点', date: goal.start_date, done: true },
            { label: '今日', date: todayIso(), done: true, current: true },
            { label: '笔试目标', date: goal.exam_date, done: days === 0 }
        ];
        milestones.innerHTML = items.map(m => `
            <div class="milestone ${m.current ? 'current' : ''} ${m.done && !m.current ? 'done' : ''}">
                <span class="milestone-dot"></span>
                <span class="milestone-label">${escapeHtml(m.label)}</span>
                <span class="milestone-date">${escapeHtml(m.date?.slice(5) || '')}</span>
            </div>
        `).join('');
    }

    const prepBar = document.getElementById('dashboard-prep-bar');
    const prepPctEl = document.getElementById('dashboard-prep-percent');
    if (prepBar) prepBar.style.width = `${prepPct}%`;
    if (prepPctEl) prepPctEl.textContent = `${prepPct}%`;

    updateProgressRing(planRate || 0);
}

function setKpiSkeleton() {
    ['kpi-tasks', 'kpi-hours', 'kpi-rate', 'kpi-streak'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<span class="skeleton-inline"></span>';
    });
    const heatmap = document.getElementById('dashboard-heatmap');
    if (heatmap) renderLoading(heatmap, '加载学习热力图...');
    const tasks = document.getElementById('dashboard-tasks');
    if (tasks) renderLoading(tasks, '加载今日任务...');
}

async function initDashboard() {
    if (!document.getElementById('dashboard-tasks')) return;

    setKpiSkeleton();
    const today = todayIso();

    const [progressRes, planItemsRes, goalRes, recoRes] = await Promise.all([
        getProgress({ days: 84 }),
        getPlanItems({ date: today }),
        getPlanGoal(),
        getRecommendations()
    ]);

    const todayItems = planItemsRes.ok && planItemsRes.data.success
        ? (planItemsRes.data.data.items || []) : [];
    renderTodayTasks(todayItems);

    const completedToday = todayItems.filter(i => i.is_completed).length;
    const totalToday = todayItems.length;

    let planRate = 0;
    if (progressRes.ok && progressRes.data.success) {
        const data = progressRes.data.data;
        const o = data.overview;
        planRate = o.plan_completion_rate || 0;

        const kpiTasks = document.getElementById('kpi-tasks');
        const kpiHours = document.getElementById('kpi-hours');
        const kpiRate = document.getElementById('kpi-rate');
        const kpiStreak = document.getElementById('kpi-streak');

        const todayMinutes = (data.daily_study_minutes || []).find(d => d.date === today);
        const hoursToday = todayMinutes ? (todayMinutes.minutes / 60).toFixed(1) : '0';

        if (kpiTasks) kpiTasks.innerHTML = `${completedToday}/${totalToday || '—'} <small>项</small>`;
        if (kpiHours) kpiHours.innerHTML = `${hoursToday} <small>h</small>`;
        if (kpiRate) {
            const rate = totalToday ? Math.round(completedToday / totalToday * 100) : planRate;
            kpiRate.innerHTML = `${rate}<small>%</small>`;
        }
        if (kpiStreak) kpiStreak.innerHTML = `${o.streak_days}<small>天</small>`;

        renderHeatmap(data.daily_study_minutes || []);
    }

    if (recoRes.ok && recoRes.data.success) {
        renderWeakBars(recoRes.data.data.weak_subjects || []);
    }

    if (goalRes.ok && goalRes.data.success && goalRes.data.data) {
        renderCountdown(goalRes.data.data, planRate);
    }
}

function bootDashboard() {
    if (document.getElementById('dashboard-tasks')) initDashboard();
}
if (document.body.classList.contains('app-ready')) {
    bootDashboard();
} else {
    window.addEventListener('app:ready', bootDashboard, { once: true });
}