const RECO_THUMB_CLASSES = ['', 'green', 'orange'];

function renderWeakBars(weakSubjects) {
    const container = document.getElementById('reco-weak-bars');
    if (!container) return;

    if (!weakSubjects.length) {
        container.innerHTML = '<p class="muted">暂无答题数据，完成练习后将识别薄弱模块</p>';
        return;
    }

    container.innerHTML = weakSubjects.map(w => `
        <div class="bar-row">
            <span>${escapeHtml(w.subject_name)}</span>
            <div class="progress orange"><span style="width:${Math.round(w.accuracy)}%"></span></div>
            <strong>${Math.round(w.accuracy)}%</strong>
        </div>
    `).join('');
}

function renderGoal(goal, planProgress) {
    const typeEl = document.getElementById('reco-goal-type');
    const examEl = document.getElementById('reco-goal-exam');
    const barEl = document.getElementById('reco-goal-progress');
    const descEl = document.getElementById('reco-goal-desc');

    if (goal) {
        if (typeEl) typeEl.textContent = goal.exam_type || '考试目标';
        if (examEl) examEl.textContent = goal.exam_date || '—';
    } else {
        if (typeEl) typeEl.textContent = '未设置目标';
        if (examEl) examEl.textContent = '前往计划页设置';
    }

    const progress = planProgress || 0;
    if (barEl) barEl.style.width = `${progress}%`;
    if (descEl) descEl.textContent = `当前进度 ${progress}%，系统会优先推荐弱项提升内容。`;
}

function renderRecommendations(items) {
    const container = document.getElementById('reco-list');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<p class="muted">暂无推荐，请先完成一些练习</p>';
        return;
    }

    container.innerHTML = items.map((item, i) => {
        const thumbClass = RECO_THUMB_CLASSES[i % RECO_THUMB_CLASSES.length];
        const btnClass = item.type === 'resource' ? 'ghost' : 'primary';
        const btnText = item.type === 'resource' ? '查看资料' : '去学习';
        return `
            <article class="reco-card">
                <div class="reco-thumb ${thumbClass}">${escapeHtml(item.subject_name)}<br/>${escapeHtml(item.subtitle || '')}</div>
                <div class="reco-body">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.reason)}</p>
                    <span class="tag green">匹配度 ${item.match_score}%</span>
                </div>
                <a class="btn ${btnClass}" href="${escapeHtml(item.link)}">${btnText}</a>
            </article>
        `;
    }).join('');
}

async function initRecommendations() {
    if (!document.getElementById('reco-list')) return;

    renderLoading(document.getElementById('reco-list'), '加载推荐中...');

    const result = await getRecommendations();
    if (!result.ok || !result.data.success) {
        renderError(document.getElementById('reco-list'));
        showToast('推荐数据加载失败', 'error');
        return;
    }

    const data = result.data.data;
    renderWeakBars(data.weak_subjects || []);
    renderGoal(data.goal, data.plan_progress);
    renderRecommendations(data.items || []);
}

function bootRecommendations() {
    if (document.getElementById('reco-list')) initRecommendations();
}
if (document.body.classList.contains('app-ready')) {
    bootRecommendations();
} else {
    window.addEventListener('app:ready', bootRecommendations, { once: true });
}