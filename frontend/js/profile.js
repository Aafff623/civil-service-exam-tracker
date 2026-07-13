function formatDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function roleLabel(role) {
    return role === 'admin' ? '管理员' : '学习者';
}

function roleBio(user) {
    if (user.role === 'admin') {
        return '系统演示管理员账号，可管理考试资源并查看完整学习数据，用于课程答辩与功能展示。';
    }
    return '备考学习者账号，系统将根据你的答题记录与计划进度提供个性化推荐。';
}

function renderGoal(goal) {
    const body = document.getElementById('profile-goal-body');
    if (!body) return;

    if (!goal) {
        body.innerHTML = '<p class="muted">尚未设置备考目标，<a class="link" href="plan.html">前往学习计划</a> 填写考试日期与每日学习时长。</p>';
        return;
    }

    body.innerHTML = `
        <div class="profile-goal-grid">
            <div class="profile-goal-item"><span>考试类型</span><strong>${escapeHtml(goal.exam_type || '—')}</strong></div>
            <div class="profile-goal-item"><span>目标考试日</span><strong>${escapeHtml(goal.exam_date || '—')}</strong></div>
            <div class="profile-goal-item"><span>备考起点</span><strong>${escapeHtml(goal.start_date || '—')}</strong></div>
            <div class="profile-goal-item"><span>每日学习</span><strong>${goal.daily_minutes || '—'} 分钟</strong></div>
        </div>`;
}

function statBarWidth(label, overview) {
    if (label.includes('率')) {
        const key = label.includes('计划') ? 'plan_completion_rate' : 'answer_accuracy';
        return Math.min(100, Number(overview[key]) || 0);
    }
    if (label.includes('任务')) {
        return Math.min(100, (Number(overview.completed_tasks) || 0) * 8);
    }
    return Math.min(100, (Number(overview.max_streak_days) || 0) * 14);
}

function renderQuickStats(overview) {
    const box = document.getElementById('profile-quick-stats');
    if (!box || !overview) return;

    const rows = [
        ['计划完成率', `${overview.plan_completion_rate || 0}%`],
        ['做题正确率', `${overview.answer_accuracy || 0}%`],
        ['完成任务数', `${overview.completed_tasks || 0} 项`],
        ['最长连续打卡', `${overview.max_streak_days || 0} 天`]
    ];

    box.innerHTML = rows.map(([label, value]) => `
        <div class="bar-row">
            <span>${escapeHtml(label)}</span>
            <div class="progress blue"><span style="width:${statBarWidth(label, overview)}%"></span></div>
            <span class="metric-value">${escapeHtml(value)}</span>
        </div>
    `).join('');
}

async function initProfile() {
    if (!document.getElementById('profile-card')) return;

    try {
        const [meRes, progressRes, goalRes] = await Promise.all([
            getMe(),
            getProgress({ days: 7 }),
            getPlanGoal()
        ]);

        if (!meRes.ok || !meRes.data.success) {
            if (typeof isMockMode === 'function' && isMockMode()) {
                // Mock mode provides a user; continue.
            } else {
                window.location.replace('login.html');
                return;
            }
        }

        const user = meRes.data.data;
        syncSidebarMeta(user);

        const roleTag = document.getElementById('profile-role-tag');
        const idTag = document.getElementById('profile-id-tag');
        const bio = document.getElementById('profile-bio');
        const created = document.getElementById('profile-created');
        const adminCard = document.getElementById('profile-admin-card');
        const learnerCard = document.getElementById('profile-learner-card');

        if (roleTag) {
            roleTag.textContent = roleLabel(user.role);
            roleTag.className = `tag ${user.role === 'admin' ? 'orange' : 'blue'}`;
        }
        if (idTag) idTag.textContent = `ID ${user.id}`;
        if (bio) bio.textContent = roleBio(user);
        if (created) created.textContent = formatDateTime(user.created_at);

        if (user.role === 'admin') {
            if (adminCard) adminCard.hidden = false;
            if (learnerCard) learnerCard.classList.add('span-2');
        }

        if (progressRes.ok && progressRes.data.success) {
            const overview = progressRes.data.data.overview || {};
            const streak = document.getElementById('profile-streak');
            const hours = document.getElementById('profile-hours');
            const answers = document.getElementById('profile-answers');
            if (streak) streak.textContent = `${overview.streak_days || 0} 天`;
            if (hours) hours.textContent = `${overview.total_study_hours || 0} 小时`;
            if (answers) answers.textContent = `${overview.total_answers || 0} 题`;
            renderQuickStats(overview);
        }

        const goal = goalRes.ok && goalRes.data.success ? goalRes.data.data : null;
        renderGoal(goal);
    } catch (err) {
        console.error('initProfile failed', err);
        showToast('个人信息加载失败', 'error');
    } finally {
        notifyModuleReady();
    }
}

let profileBooted = false;

function bootProfile() {
    if (profileBooted || !document.getElementById('profile-card')) return;
    profileBooted = true;
    initProfile();
}

window.addEventListener('app:ready', bootProfile, { once: true });
bootProfile();