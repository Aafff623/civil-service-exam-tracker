const RECO_THUMB_VARIANTS = ['', 'teal', 'amber', 'indigo'];

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
            <span class="metric-value">${Math.round(w.accuracy)}%</span>
        </div>
    `).join('');
}

function renderPreferences(data) {
    const container = document.getElementById('reco-preferences');
    if (!container) return;

    const tags = new Set();
    const weak = data.weak_subjects || [];
    const items = data.items || [];

    if (weak.length) tags.add('弱项专攻');
    if (items.some(i => i.type === 'question')) tags.add('专项练习');
    if (items.some(i => i.type === 'resource')) tags.add('图文资料');
    if (weak.some(w => (w.accuracy || 100) < 60)) tags.add('错题复盘');
    if (!tags.size) {
        tags.add('系统备考');
        tags.add('入门推荐');
    }

    const tagTone = {
        '弱项专攻': 'red',
        '专项练习': 'blue',
        '图文资料': 'green',
        '错题复盘': 'orange',
        '系统备考': 'purple',
        '入门推荐': 'blue'
    };
    container.innerHTML = [...tags].map(t => {
        const tone = tagTone[t] || '';
        return `<span class="tag${tone ? ' ' + tone : ''}">${escapeHtml(t)}</span>`;
    }).join(' ');
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
        container.innerHTML = `
            <div class="empty-visual">
                <p class="muted">暂无推荐 📭 先去题库完成几道练习吧</p>
                <a class="btn primary" href="qa.html">✍️ 开始练习</a>
            </div>`;
        return;
    }

    container.innerHTML = items.map((item, i) => {
        const thumbClass = RECO_THUMB_VARIANTS[i % RECO_THUMB_VARIANTS.length];
        const btnClass = item.type === 'resource' ? 'ghost' : 'primary';
        const btnText = item.type === 'resource' ? '查看资料' : '去学习';
        return `
            <article class="reco-card surface-spotlight">
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
    initSurfaceSpotlight();
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
    renderPreferences(data);
    renderGoal(data.goal, data.plan_progress);
    renderRecommendations(data.items || []);
}

let recommendationsBooted = false;

function bootRecommendations() {
    if (recommendationsBooted || !document.getElementById('reco-list')) return;
    recommendationsBooted = true;
    initRecommendations();
}
window.addEventListener('app:ready', bootRecommendations, { once: true });
bootRecommendations();