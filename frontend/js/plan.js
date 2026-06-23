const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

let lastPlanSnapshot = null;

function formatLocalDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultStartDate() {
    return formatLocalDate(new Date());
}

function defaultExamDate() {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return formatLocalDate(d);
}

function getGoalFromForm() {
    return {
        exam_type: document.getElementById('goal-exam-type')?.value || '国考',
        start_date: document.getElementById('goal-start-date')?.value,
        exam_date: document.getElementById('goal-exam-date')?.value,
        daily_minutes: parseInt(document.getElementById('goal-daily-minutes')?.value || '180', 10)
    };
}

function fillGoalForm(goal) {
    if (!goal) return;
    const examType = document.getElementById('goal-exam-type');
    const startDate = document.getElementById('goal-start-date');
    const examDate = document.getElementById('goal-exam-date');
    const dailyMinutes = document.getElementById('goal-daily-minutes');
    if (examType) examType.value = goal.exam_type || '国考';
    if (startDate) startDate.value = goal.start_date || defaultStartDate();
    if (examDate) examDate.value = goal.exam_date || defaultExamDate();
    if (dailyMinutes) dailyMinutes.value = String(goal.daily_minutes || 180);
}

function setPlanStep(step) {
    document.querySelectorAll('#plan-stepper .step').forEach(el => {
        const n = parseInt(el.getAttribute('data-step'), 10);
        el.classList.toggle('active', n === step);
        el.classList.toggle('done', n < step);
    });
}

function flashSection(el) {
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.add('flash-update');
    setTimeout(() => el.classList.remove('flash-update'), 1200);
}

async function initPlan() {
    if (!document.getElementById('plan-generate-btn')) return;

    const startInput = document.getElementById('goal-start-date');
    const examInput = document.getElementById('goal-exam-date');
    if (startInput && !startInput.value) startInput.value = defaultStartDate();
    if (examInput && !examInput.value) examInput.value = defaultExamDate();

    await loadPlanSubjects();
    await loadExistingPlan();

    const btn = document.getElementById('plan-generate-btn');
    if (btn) btn.addEventListener('click', handleGeneratePlan);
}

async function loadPlanSubjects() {
    const tbody = document.getElementById('plan-subjects-body');
    if (!tbody) return;

    const result = await getPlanSubjects();
    if (!result.ok || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="3" class="muted">加载科目失败</td></tr>';
        return;
    }

    const items = result.data.data.items || [];
    tbody.innerHTML = items.map(s => `
        <tr>
            <td>${escapeHtml(s.name)}</td>
            <td class="star">${escapeHtml(s.importance_stars)}</td>
            <td>${escapeHtml(s.difficulty_label)}</td>
        </tr>
    `).join('');
}

async function loadExistingPlan() {
    const goalResult = await getPlanGoal();
    if (goalResult.ok && goalResult.data.success && goalResult.data.data) {
        fillGoalForm(goalResult.data.data);
    }

    const planResult = await getPlan();
    if (!planResult.ok || !planResult.data.success) return;

    const plan = planResult.data.data.plan;
    const goal = planResult.data.data.goal;
    if (plan) {
        lastPlanSnapshot = { total_items: plan.total_items, total_days: plan.total_days };
        renderPlanPreview(plan, goal);
        setPlanStep(3);
        await loadWeekSchedule();
        await loadUpcomingPreview();
    }
}

async function handleGeneratePlan() {
    const btn = document.getElementById('plan-generate-btn');
    const goal = getGoalFromForm();

    if (!goal.start_date || !goal.exam_date) {
        showToast('请填写开始日期和预计考试时间', 'error');
        return;
    }

    if (new Date(goal.exam_date) <= new Date(goal.start_date)) {
        showToast('预计考试时间必须晚于开始日期', 'error');
        return;
    }

    setPlanStep(2);
    setButtonLoading(btn, true, '生成中');

    await savePlanGoal(goal);
    const result = await generatePlan(goal);

    setButtonLoading(btn, false);

    if (!result.ok || !result.data.success) {
        setPlanStep(1);
        showToast(result.data.message || '生成失败，请稍后重试', 'error');
        return;
    }

    setPlanStep(3);

    const planResult = await getPlan();
    const goalResult = await getPlanGoal();
    const savedGoal = goalResult.ok && goalResult.data.success ? goalResult.data.data : goal;

    let planData;
    if (planResult.ok && planResult.data.success && planResult.data.data.plan) {
        planData = planResult.data.data.plan;
    } else {
        planData = {
            total_weeks: result.data.data.total_weeks,
            total_items: result.data.data.total_items,
            total_days: result.data.data.total_days,
            phases: result.data.data.phases,
            completed_items: 0
        };
    }

    renderPlanPreview(planData, savedGoal, result.data.data);
    await loadWeekSchedule();
    await loadUpcomingPreview();

    const preview = document.getElementById('plan-result');
    const upcoming = document.getElementById('plan-upcoming');
    flashSection(preview);
    flashSection(upcoming);
    if (preview) preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderPlanPreview(plan, goal, generateMeta) {
    const summary = document.getElementById('plan-summary');
    const phasesBox = document.getElementById('plan-phases');
    const statsBox = document.getElementById('plan-stats');
    const badge = document.getElementById('plan-result-badge');

    const prevItems = lastPlanSnapshot?.total_items;
    const delta = prevItems != null && plan.total_items != null
        ? plan.total_items - prevItems : null;
    lastPlanSnapshot = { total_items: plan.total_items, total_days: plan.total_days };

    if (badge) {
        const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        badge.textContent = `已更新 ${now}`;
    }

    if (statsBox) {
        statsBox.innerHTML = `
            <div class="plan-stat-card">
                <span>学习周期</span>
                <strong>${plan.total_days || '—'}<small>天</small></strong>
            </div>
            <div class="plan-stat-card">
                <span>任务总数</span>
                <strong>${plan.total_items || '—'}<small>项</small></strong>
                ${delta != null && delta !== 0 ? `<em class="${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '+' : ''}${delta}</em>` : ''}
            </div>
            <div class="plan-stat-card">
                <span>每日学习</span>
                <strong>${goal?.daily_minutes || '—'}<small>分钟</small></strong>
            </div>
            <div class="plan-stat-card">
                <span>考试目标</span>
                <strong>${escapeHtml(goal?.exam_type || '—')}</strong>
                <small>${escapeHtml(goal?.exam_date || '')}</small>
            </div>
        `;
    }

    if (summary) {
        const completed = plan.completed_items || 0;
        summary.innerHTML = `已根据你的目标生成 <strong>${plan.total_weeks} 周</strong> 学习计划，共 <strong>${plan.total_items} 个任务</strong>（已完成 ${completed} 项）。${generateMeta?.plan_id ? ` 计划编号 #${generateMeta.plan_id}。` : ''}`;
    }

    if (phasesBox && plan.phases) {
        phasesBox.innerHTML = plan.phases.map((phase, i) => `
            <div class="card soft phase-card">
                <span class="phase-index">阶段 ${i + 1}</span>
                <h3>${escapeHtml(phase.name)}</h3>
                <p class="muted">${escapeHtml(phase.description)}</p>
                <span class="tag blue">约 ${phase.weeks} 周</span>
            </div>
        `).join('');
    }

    const preview = document.getElementById('plan-result');
    if (preview) preview.classList.remove('hidden');
}

function weekRange() {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        from: formatLocalDate(monday),
        to: formatLocalDate(sunday)
    };
}

function upcomingRange(days = 7) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days - 1);
    return { from: formatLocalDate(start), to: formatLocalDate(end) };
}

async function loadUpcomingPreview() {
    const box = document.getElementById('plan-upcoming-list');
    const section = document.getElementById('plan-upcoming');
    if (!box) return;

    const range = upcomingRange(7);
    const result = await getPlanItems(range);

    if (!result.ok || !result.data.success) {
        box.innerHTML = '<p class="muted">加载失败</p>';
        return;
    }

    const items = result.data.data.items || [];
    if (section) section.classList.toggle('hidden', items.length === 0);

    if (items.length === 0) {
        box.innerHTML = '<p class="muted">未来 7 天暂无任务</p>';
        return;
    }

    const byDate = {};
    items.forEach(item => {
        if (!byDate[item.item_date]) byDate[item.item_date] = [];
        byDate[item.item_date].push(item);
    });

    box.innerHTML = Object.keys(byDate).sort().map(dateStr => {
        const dayItems = byDate[dateStr];
        const done = dayItems.filter(i => i.is_completed).length;
        return `
            <div class="upcoming-day">
                <div class="upcoming-day-head">
                    <span class="upcoming-date">${escapeHtml(dateStr)}</span>
                    <span class="tag ${done === dayItems.length ? 'green' : 'orange'}">${done}/${dayItems.length} 完成</span>
                </div>
                <div class="upcoming-items">
                    ${dayItems.map(item => `
                        <span class="upcoming-chip ${item.is_completed ? 'done' : ''}">
                            ${item.is_completed ? '✓ ' : ''}${escapeHtml(item.subject_name)} · ${item.suggested_minutes}min
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

async function loadWeekSchedule() {
    const tbody = document.getElementById('plan-week-body');
    if (!tbody) return;

    const range = weekRange();
    const result = await getPlanItems(range);

    if (!result.ok || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="4" class="muted">加载失败</td></tr>';
        return;
    }

    const items = result.data.data.items || [];
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="muted">本周暂无计划任务，请先生成学习计划</td></tr>';
        return;
    }

    const byDate = {};
    items.forEach(item => {
        if (!byDate[item.item_date]) byDate[item.item_date] = [];
        byDate[item.item_date].push(item);
    });

    const rows = Object.keys(byDate).sort().map(dateStr => {
        const d = new Date(dateStr + 'T00:00:00');
        const label = `${WEEKDAY_NAMES[d.getDay()]} ${dateStr.slice(5)}`;
        const dayItems = byDate[dateStr];
        const slots = ['—', '—', '—'];
        dayItems.slice(0, 3).forEach((item, idx) => {
            const status = item.is_completed ? '✓ ' : '';
            slots[idx] = `${status}${item.subject_name} ${item.suggested_minutes}min`;
        });

        const actions = dayItems.map(item => `
            <button class="btn ghost" style="font-size:12px;padding:4px 8px;margin:2px;"
                data-toggle-item="${item.id}" data-completed="${item.is_completed ? '1' : '0'}">
                ${item.is_completed ? '取消' : '完成'}：${escapeHtml(item.subject_name.slice(0, 4))}
            </button>
        `).join('');

        return `
            <tr>
                <td>${escapeHtml(label)}</td>
                <td>${escapeHtml(slots[0])}</td>
                <td>${escapeHtml(slots[1])}</td>
                <td>${escapeHtml(slots[2])}<div style="margin-top:6px;">${actions}</div></td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
    tbody.querySelectorAll('[data-toggle-item]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (btn.disabled) return;
            const id = btn.getAttribute('data-toggle-item');
            const completed = btn.getAttribute('data-completed') === '1';
            setButtonLoading(btn, true, '…');
            const res = await updatePlanItem(id, !completed);
            setButtonLoading(btn, false);
            if (!res.ok || !res.data.success) {
                showToast(res.data.message || '更新失败', 'error');
                return;
            }
            showToast(completed ? '已取消完成' : '任务已完成', 'success');
            await loadWeekSchedule();
            await loadUpcomingPreview();
        });
    });
}

function bootPlan() {
    if (!document.getElementById('plan-generate-btn')) {
        notifyModuleReady();
        return;
    }
    initPlan().finally(() => notifyModuleReady());
}
if (document.body.classList.contains('app-ready')) {
    bootPlan();
} else {
    window.addEventListener('app:ready', bootPlan, { once: true });
}