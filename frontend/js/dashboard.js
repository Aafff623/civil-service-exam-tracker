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

function renderWeakBars(weakSubjects) {
    const container = document.getElementById('dashboard-weak-bars');
    const tip = document.getElementById('dashboard-weak-tip');
    if (!container) return;

    if (!weakSubjects.length) {
        container.innerHTML = '<p class="muted">完成练习后将显示弱项分析</p>';
        if (tip) tip.textContent = '📘 建议先去题库完成几道练习题。';
        return;
    }

    container.innerHTML = weakSubjects.slice(0, 3).map(w => `
        <div class="bar-row">
            <span>${escapeHtml(w.subject_name)}</span>
            <div class="progress orange"><span style="width:${Math.round(w.accuracy)}%"></span></div>
            <strong>${Math.round(w.accuracy)}%</strong>
        </div>
    `).join('');

    if (tip) {
        tip.textContent = `📘 建议今天优先加强「${weakSubjects[0].subject_name}」专项训练。`;
    }
}

function renderHeatmap(dailyMinutes) {
    const container = document.getElementById('dashboard-heatmap');
    if (!container || !dailyMinutes.length) return;

    const max = Math.max(...dailyMinutes.map(d => d.minutes), 1);
    container.innerHTML = dailyMinutes.map(d => {
        const ratio = d.minutes / max;
        const level = ratio > 0.75 ? 'l4' : ratio > 0.5 ? 'l3' : ratio > 0.25 ? 'l2' : ratio > 0 ? 'l1' : 'l0';
        return `<span class="${level}" title="${d.date}: ${d.minutes}min"></span>`;
    }).join('');
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
    if (desc) desc.textContent = `当前总进度 ${pct}%，坚持完成每日计划任务。`;
}

async function initDashboard() {
    if (!document.getElementById('dashboard-tasks')) return;

    const today = todayIso();

    const [progressRes, planItemsRes, goalRes, recoRes] = await Promise.all([
        getProgress({ days: 30 }),
        getPlanItems({ date: today }),
        getPlanGoal(),
        getRecommendations()
    ]);

    const todayItems = planItemsRes.ok && planItemsRes.data.success
        ? (planItemsRes.data.data.items || []) : [];
    renderTodayTasks(todayItems);

    const completedToday = todayItems.filter(i => i.is_completed).length;
    const totalToday = todayItems.length;

    if (progressRes.ok && progressRes.data.success) {
        const data = progressRes.data.data;
        const o = data.overview;

        const kpiTasks = document.getElementById('kpi-tasks');
        const kpiHours = document.getElementById('kpi-hours');
        const kpiRate = document.getElementById('kpi-rate');
        const kpiStreak = document.getElementById('kpi-streak');

        const todayMinutes = (data.daily_study_minutes || []).find(d => d.date === today);
        const hoursToday = todayMinutes ? (todayMinutes.minutes / 60).toFixed(1) : '0';

        if (kpiTasks) kpiTasks.innerHTML = `${completedToday}/${totalToday || '—'} <small>项</small>`;
        if (kpiHours) kpiHours.innerHTML = `${hoursToday} <small>h</small>`;
        if (kpiRate) {
            const rate = totalToday ? Math.round(completedToday / totalToday * 100) : o.plan_completion_rate;
            kpiRate.innerHTML = `${rate}<small>%</small>`;
        }
        if (kpiStreak) kpiStreak.innerHTML = `${o.streak_days}<small>天</small>`;

        updateProgressRing(o.plan_completion_rate);
        renderHeatmap(data.daily_study_minutes || []);
    }

    if (recoRes.ok && recoRes.data.success) {
        renderWeakBars(recoRes.data.data.weak_subjects || []);
    }

    if (goalRes.ok && goalRes.data.success && goalRes.data.data) {
        const days = daysUntil(goalRes.data.data.exam_date);
        const countdown = document.getElementById('dashboard-countdown-days');
        if (countdown && days !== null) {
            countdown.innerHTML = `${days}<small>天</small>`;
        }
        const yearTag = document.getElementById('dashboard-exam-year');
        if (yearTag) yearTag.textContent = goalRes.data.data.exam_date?.slice(0, 4) || '—';
    }
}

if (document.getElementById('dashboard-tasks')) {
    initDashboard();
}