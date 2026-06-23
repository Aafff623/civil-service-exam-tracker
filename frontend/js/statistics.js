function formatDelta(value, unit, suffix = '') {
    if (value > 0) return `<span class="up">+${value}${unit}</span> 较上周${suffix}`;
    if (value < 0) return `<span class="down">${value}${unit}</span> 较上周${suffix}`;
    return '与上周持平';
}

function buildLineChartSvg(labels, values, maxVal, unitLabel) {
    if (!values.length) {
        return '<p class="muted" style="padding:20px;">暂无数据</p>';
    }

    const max = maxVal || Math.max(...values, 1);
    const plotH = 120;
    const baseY = 150;
    const startX = 60;
    const endX = 492;
    const step = values.length > 1 ? (endX - startX) / (values.length - 1) : 0;

    const points = values.map((v, i) => {
        const x = startX + i * step;
        const y = baseY - (v / max) * plotH;
        return { x, y };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
    const circles = points.map(p =>
        `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#0b66ff"/>`
    ).join('');
    const xLabels = points.map((p, i) =>
        `<text x="${p.x - 12}" y="195" fill="#7a8aa6" font-size="11">${escapeHtml(labels[i] || '')}</text>`
    ).join('');

    const ticks = [max, max * 0.75, max * 0.5, max * 0.25].map((t, i) => {
        const y = 30 + i * 40;
        const label = unitLabel === '%' ? `${Math.round(t)}%` : `${(t / 60).toFixed(1)}h`;
        return `<text x="8" y="${y + 4}" fill="#7a8aa6" font-size="11">${label}</text>`;
    }).join('');

    return `<svg viewBox="0 0 520 210" width="100%" height="210" role="img">
      <defs><linearGradient id="gline-stats" x1="0" x2="1"><stop stop-color="#0b66ff"/><stop offset="1" stop-color="#5aa8ff"/></linearGradient></defs>
      <g stroke="#e5edf9" stroke-width="1"><line x1="40" y1="30" x2="500" y2="30"/><line x1="40" y1="70" x2="500" y2="70"/><line x1="40" y1="110" x2="500" y2="110"/><line x1="40" y1="150" x2="500" y2="150"/></g>
      <g>${ticks}</g>
      <path d="${pathD}" fill="none" stroke="url(#gline-stats)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <g>${circles}</g>
      <g>${xLabels}</g>
    </svg>`;
}

function renderSubjectBars(subjects) {
    const container = document.getElementById('subject-bars');
    if (!container) return;

    if (!subjects.length) {
        container.innerHTML = '<p class="muted">暂无计划或答题数据，请先生成学习计划或做题练习</p>';
        return;
    }

    container.innerHTML = subjects.map(s => {
        const rate = s.completion_rate || 0;
        const acc = s.accuracy != null ? ` · 正确率 ${s.accuracy}%` : '';
        return `
            <div class="bar-row">
                <span>${escapeHtml(s.subject_name)}</span>
                <div class="progress"><span style="width:${rate}%"></span></div>
                <span class="metric-value">${rate}%</span>
            </div>
            <div class="muted" style="font-size:12px;margin:-6px 0 10px 92px;">${s.completed || 0}/${s.total || 0} 项${acc}</div>
        `;
    }).join('');
}

function renderCalendar(year, month, checkedDates) {
    const container = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-title');
    if (!container) return;

    if (title) title.textContent = `${year} 年 ${month} 月`;

    const checked = new Set(checkedDates || []);
    const first = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    let startPad = first.getDay();
    startPad = startPad === 0 ? 6 : startPad - 1;

    let html = ['一', '二', '三', '四', '五', '六', '日']
        .map(w => `<div class="week">${w}</div>`).join('');

    for (let i = 0; i < startPad; i++) {
        html += '<div></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cls = checked.has(iso) ? 'checked' : '';
        html += `<div class="${cls}">${d}</div>`;
    }

    container.innerHTML = html;
}

function renderOverview(overview) {
    const hours = document.getElementById('kpi-hours');
    const hoursDelta = document.getElementById('kpi-hours-delta');
    const tasks = document.getElementById('kpi-tasks');
    const planRate = document.getElementById('kpi-plan-rate');
    const accuracy = document.getElementById('kpi-accuracy');
    const accuracyDelta = document.getElementById('kpi-accuracy-delta');
    const answers = document.getElementById('kpi-answers');
    const streak = document.getElementById('kpi-streak');
    const maxStreak = document.getElementById('kpi-max-streak');

    if (hours) hours.innerHTML = `${overview.total_study_hours}<small>h</small>`;
    if (hoursDelta) hoursDelta.innerHTML = formatDelta(overview.study_hours_delta, 'h');
    if (tasks) tasks.textContent = overview.completed_tasks;
    if (planRate) planRate.textContent = `完成率 ${overview.plan_completion_rate}%`;
    if (accuracy) accuracy.innerHTML = `${overview.answer_accuracy}<small>%</small>`;
    if (accuracyDelta) {
        accuracyDelta.innerHTML = overview.total_answers
            ? formatDelta(overview.accuracy_delta, '%', '提升')
            : '暂无答题记录';
    }
    if (answers) answers.textContent = overview.total_answers;
    if (streak) streak.innerHTML = `${overview.streak_days}<small>天</small>`;
    if (maxStreak) maxStreak.textContent = `最长连续 ${overview.max_streak_days} 天`;
}

async function initStatistics() {
    if (!document.getElementById('kpi-hours')) return;

    document.querySelectorAll('.kpi-value').forEach(el => {
        el.innerHTML = '<span class="skeleton-inline"></span>';
    });

    const now = new Date();
    const result = await getProgress({
        days: 7,
        year: now.getFullYear(),
        month: now.getMonth() + 1
    });

    if (!result.ok || !result.data.success) {
        document.querySelectorAll('.kpi-value').forEach(el => { el.textContent = '—'; });
        showToast('统计数据加载失败', 'error');
        return;
    }

    const data = result.data.data;
    renderOverview(data.overview);

    const studyChart = document.getElementById('study-chart');
    if (studyChart) {
        const minutes = (data.daily_study_minutes || []).map(d => d.minutes);
        const labels = (data.daily_study_minutes || []).map(d => d.label);
        studyChart.innerHTML = buildLineChartSvg(labels, minutes, null, 'h');
    }

    renderSubjectBars(data.subject_stats || []);

    const accChart = document.getElementById('accuracy-chart');
    if (accChart) {
        const trend = data.accuracy_trend || [];
        const accs = trend.map(d => d.accuracy);
        const labels = trend.map(d => d.label);
        accChart.innerHTML = buildLineChartSvg(labels, accs, 100, '%');
    }

    const cal = data.calendar || {};
    renderCalendar(cal.year, cal.month, cal.checked_dates);
}

function bootStatistics() {
    if (!document.getElementById('kpi-hours')) return;
    initStatistics();
}
if (document.body.classList.contains('app-ready')) {
    bootStatistics();
} else {
    window.addEventListener('app:ready', bootStatistics, { once: true });
}