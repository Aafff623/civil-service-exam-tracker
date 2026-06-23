const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function defaultStartDate() {
    return new Date().toISOString().slice(0, 10);
}

function defaultExamDate() {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
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
    if (plan) {
        renderPlanPreview(plan);
        await loadWeekSchedule();
    }
}

async function handleGeneratePlan() {
    const btn = document.getElementById('plan-generate-btn');
    const goal = getGoalFromForm();

    if (!goal.start_date || !goal.exam_date) {
        alert('请填写开始日期和预计考试时间');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = '生成中...';
    }

    const result = await generatePlan(goal);

    if (btn) {
        btn.disabled = false;
        btn.textContent = '生成学习计划';
    }

    if (!result.ok || !result.data.success) {
        alert(result.data.message || '生成失败，请稍后重试');
        return;
    }

    const planResult = await getPlan();
    if (planResult.ok && planResult.data.success && planResult.data.data.plan) {
        renderPlanPreview(planResult.data.data.plan);
    } else {
        renderPlanPreview({
            total_weeks: result.data.data.total_weeks,
            total_items: result.data.data.total_items,
            phases: result.data.data.phases
        });
    }

    await loadWeekSchedule();

    const preview = document.getElementById('plan-result');
    if (preview) {
        preview.classList.remove('hidden');
        preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function renderPlanPreview(plan) {
    const summary = document.getElementById('plan-summary');
    const phasesBox = document.getElementById('plan-phases');

    if (summary) {
        summary.innerHTML = `已为你生成个性化学习计划，覆盖 <strong>${plan.total_weeks} 周</strong>，包含 <strong>${plan.total_items} 个学习任务</strong>。`;
    }

    if (phasesBox && plan.phases) {
        phasesBox.innerHTML = plan.phases.map(phase => `
            <div class="card soft">
                <h3>${escapeHtml(phase.name)}</h3>
                <p class="muted">${escapeHtml(phase.description)}</p>
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
        from: monday.toISOString().slice(0, 10),
        to: sunday.toISOString().slice(0, 10)
    };
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
            const id = btn.getAttribute('data-toggle-item');
            const completed = btn.getAttribute('data-completed') === '1';
            await updatePlanItem(id, !completed);
            await loadWeekSchedule();
        });
    });
}

if (document.getElementById('plan-generate-btn')) {
    initPlan();
}