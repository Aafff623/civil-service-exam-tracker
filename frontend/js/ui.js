function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function setButtonLoading(button, isLoading, loadingText) {
    if (!button) return;
    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
    const original = button.dataset.originalText || button.textContent;
    if (isLoading) {
        button.dataset.originalText = original;
        button.innerHTML = `<span class="spinner" aria-hidden="true"></span>${loadingText || '处理中...'}`;
    } else {
        button.textContent = original;
    }
}

function renderLoading(el, text = '加载中...') {
    if (!el) return;
    el.innerHTML = `<p class="state-loading">${escapeHtml(text)}</p>`;
}

function renderEmpty(el, text) {
    if (!el) return;
    el.innerHTML = `<p class="state-empty">${escapeHtml(text)}</p>`;
}

function renderError(el, text = '加载失败，请稍后重试') {
    if (!el) return;
    el.innerHTML = `<p class="state-error">${escapeHtml(text)}</p>`;
}

const PAGE_LOAD_TEXT = '正在加载中';
const SHELL_REVEAL_MS = 180;
const NAV_LEAVE_MS = 200;
let pageRevealDone = false;
let shellRevealScheduled = false;

function showPageVeil(message = PAGE_LOAD_TEXT) {
    let veil = document.querySelector('.app-veil');
    if (!veil) {
        veil = document.createElement('div');
        veil.className = 'app-veil app-veil-main';
        veil.setAttribute('aria-live', 'polite');
        veil.setAttribute('aria-busy', 'true');
        document.body.appendChild(veil);
    }
    veil.innerHTML = `
        <div class="app-veil-backdrop" aria-hidden="true"></div>
        <div class="app-veil-shimmer" aria-hidden="true"></div>
        <div class="app-veil-inner">
            <div class="app-veil-spinner" aria-hidden="true"><span></span><span></span><span></span></div>
            <span class="app-veil-text">${escapeHtml(message)}</span>
            <div class="app-veil-progress" aria-hidden="true"><span></span></div>
        </div>`;
    veil.classList.remove('is-hidden', 'is-closing');
    requestAnimationFrame(() => veil.classList.add('is-open'));
    document.body.classList.add('app-pending');
    return veil;
}

function scheduleShellReveal() {
    if (pageRevealDone || shellRevealScheduled) return;
    shellRevealScheduled = true;

    let delay = SHELL_REVEAL_MS;
    try {
        if (sessionStorage.getItem('module-transition')) delay = 120;
    } catch (_) { /* ignore */ }

    const run = () => notifyModuleReady();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(run, delay), { once: true });
    } else {
        setTimeout(run, delay);
    }
}

function notifyModuleReady() {
    if (pageRevealDone) return;
    pageRevealDone = true;

    document.body.classList.remove('app-pending', 'page-leaving');
    document.body.classList.add('app-ready');

    const veil = document.querySelector('.app-veil');
    if (veil) {
        veil.setAttribute('aria-busy', 'false');
        veil.classList.remove('is-open');
        veil.classList.add('is-closing');
        setTimeout(() => veil.remove(), 420);
    }

    const main = document.querySelector('.main');
    if (main) {
        main.classList.remove('main-leave');
        void main.offsetWidth;
        main.classList.add('main-enter');
    }

    try {
        sessionStorage.removeItem('module-transition');
    } catch (_) { /* ignore */ }
}

function initSurfaceSpotlight() {
    document.querySelectorAll('.surface-spotlight').forEach(el => {
        if (el.dataset.spotlightBound) return;
        el.dataset.spotlightBound = '1';
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
            el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
        });
    });
}

function initMobileNav() {
    const app = document.querySelector('.app');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');
    if (!app || !sidebar || !main || app.dataset.mobileNavBound) return;
    app.dataset.mobileNavBound = '1';

    const mq = window.matchMedia('(max-width: 860px)');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'btn ghost nav-toggle';
    toggle.setAttribute('aria-label', '打开导航菜单');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '菜单';

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.hidden = true;

    const topActions = main.querySelector('.topbar .top-actions');
    if (topActions) topActions.prepend(toggle);
    document.body.appendChild(overlay);

    function closeNav() {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        setTimeout(() => { overlay.hidden = true; }, 220);
    }

    function openNav() {
        overlay.hidden = false;
        requestAnimationFrame(() => {
            sidebar.classList.add('is-open');
            overlay.classList.add('is-visible');
        });
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    }

    toggle.addEventListener('click', () => {
        if (!mq.matches) return;
        if (sidebar.classList.contains('is-open')) closeNav();
        else openNav();
    });

    overlay.addEventListener('click', closeNav);
    sidebar.querySelectorAll('.nav a, .logo').forEach(link => {
        link.addEventListener('click', () => {
            if (mq.matches) closeNav();
        });
    });

    mq.addEventListener('change', e => {
        if (!e.matches) closeNav();
    });
}

function navigateToModule(href) {
    const target = (href || '').split('?')[0].toLowerCase();
    const current = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!href || target === current) return;

    try {
        sessionStorage.setItem('module-transition', '1');
    } catch (_) { /* ignore */ }

    document.body.classList.add('page-leaving');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = reduced ? 0 : NAV_LEAVE_MS;
    setTimeout(() => { window.location.href = href; }, delay);
}

async function transitionSection(container, updateFn, loadingText = PAGE_LOAD_TEXT) {
    if (!container) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
        await updateFn();
        return;
    }

    container.classList.add('content-leaving');
    await new Promise(resolve => setTimeout(resolve, 160));
    renderLoading(container, loadingText);
    container.classList.remove('content-leaving');
    container.classList.add('content-entering');
    await updateFn();
    requestAnimationFrame(() => {
        container.classList.remove('content-entering');
        container.classList.add('content-entered');
        setTimeout(() => container.classList.remove('content-entered'), 280);
    });
}

function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.hidden = false;
    overlay.classList.add('is-open');
    document.body.classList.add('modal-open');
    const focusable = overlay.querySelector('input, select, textarea, button');
    if (focusable) focusable.focus();
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.hidden = true;
    if (!document.querySelector('.modal-overlay.is-open')) {
        document.body.classList.remove('modal-open');
    }
}

function bindModalDismiss(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay || overlay.dataset.bound) return;
    overlay.dataset.bound = '1';
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlayId);
    });
    overlay.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(overlayId));
    });
}

let heatmapTooltipEl = null;

function ensureHeatmapTooltip() {
    if (heatmapTooltipEl) return heatmapTooltipEl;
    heatmapTooltipEl = document.createElement('div');
    heatmapTooltipEl.className = 'heatmap-tooltip';
    heatmapTooltipEl.setAttribute('role', 'tooltip');
    heatmapTooltipEl.hidden = true;
    document.body.appendChild(heatmapTooltipEl);
    return heatmapTooltipEl;
}

function formatHeatmapDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const dt = new Date(y, m - 1, d);
    return `${y}年${m}月${d}日 · 周${weekdays[dt.getDay()]}`;
}

function heatmapLevel(minutes, max) {
    if (!minutes) return 0;
    const ratio = minutes / max;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
}

function positionHeatmapTooltip(event) {
    const tip = ensureHeatmapTooltip();
    const pad = 12;
    let x = event.clientX + pad;
    let y = event.clientY + pad;
    const rect = tip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - 8) x = event.clientX - rect.width - pad;
    if (y + rect.height > window.innerHeight - 8) y = event.clientY - rect.height - pad;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
}

function hideHeatmapTooltip() {
    const tip = ensureHeatmapTooltip();
    tip.hidden = true;
}

function showHeatmapTooltip(event, cell) {
    const tip = ensureHeatmapTooltip();
    const iso = cell.getAttribute('data-date');
    const minutes = Number(cell.getAttribute('data-minutes') || 0);
    const completed = Number(cell.getAttribute('data-completed') || 0);
    const answers = Number(cell.getAttribute('data-answers') || 0);
    const hours = (minutes / 60).toFixed(1);

    let body = minutes
        ? `<strong>${minutes} 分钟</strong>（约 ${hours} 小时）`
        : '<strong>无学习记录</strong>';
    if (minutes && (completed || answers)) {
        const parts = [];
        if (completed) parts.push(`完成任务 ${completed} 项`);
        if (answers) parts.push(`答题 ${answers} 道`);
        body += `<span class="heatmap-tooltip-sub">${parts.join(' · ')}</span>`;
    }

    tip.innerHTML = `
        <span class="heatmap-tooltip-date">${escapeHtml(formatHeatmapDate(iso))}</span>
        <span class="heatmap-tooltip-main">${body}</span>
    `;
    tip.hidden = false;
    positionHeatmapTooltip(event);
}

function buildHeatmapMonthLabels(weekCols) {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    let html = '';
    let lastMonth = -1;
    weekCols.forEach(col => {
        const firstValid = col.find(c => !c.isFuture);
        if (!firstValid) {
            html += '<span class="heatmap-month"></span>';
            return;
        }
        const m = Number(firstValid.iso.split('-')[1]);
        if (m !== lastMonth) {
            lastMonth = m;
            html += `<span class="heatmap-month has-label">${months[m - 1]}</span>`;
        } else {
            html += '<span class="heatmap-month"></span>';
        }
    });
    return html;
}

function renderStudyHeatmap(container, dailyData, options = {}) {
    if (!container) return;
    const weeks = options.weeks || 12;
    const data = dailyData || [];

    if (!data.length) {
        renderEmpty(container, '暂无学习时长数据，完成计划任务后将自动生成');
        return;
    }

    const byDate = new Map(data.map(d => [d.date, d]));
    const max = Math.max(...data.map(d => d.minutes || 0), 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const gridStart = new Date(today);
    gridStart.setDate(gridStart.getDate() - weeks * 7 + 1);
    const startDow = gridStart.getDay();
    const toMonday = startDow === 0 ? -6 : 1 - startDow;
    gridStart.setDate(gridStart.getDate() + toMonday);

    const weekCols = [];
    for (let w = 0; w < weeks; w++) {
        const col = [];
        for (let dow = 0; dow < 7; dow++) {
            const cellDate = new Date(gridStart);
            cellDate.setDate(gridStart.getDate() + w * 7 + dow);
            const iso = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
            const isFuture = cellDate > today;
            const rec = byDate.get(iso);
            col.push({
                iso,
                minutes: rec?.minutes || 0,
                completed_items: rec?.completed_items || 0,
                answer_count: rec?.answer_count || 0,
                isFuture
            });
        }
        weekCols.push(col);
    }

    const dowLabels = ['一', '', '三', '', '五', '', '日'];
    const monthsHtml = buildHeatmapMonthLabels(weekCols);

    container.innerHTML = `
        <div class="heatmap-panel">
            <div class="heatmap-months">${monthsHtml}</div>
            <div class="heatmap-body">
                <div class="heatmap-dow">${dowLabels.map(l => `<span>${l}</span>`).join('')}</div>
                <div class="heatmap-grid">
                    ${weekCols.map(col => `
                        <div class="heatmap-week">
                            ${col.map(cell => {
                                if (cell.isFuture) {
                                    return '<span class="heatmap-cell is-future" aria-hidden="true"></span>';
                                }
                                const lv = heatmapLevel(cell.minutes, max);
                                return `<button type="button" class="heatmap-cell l${lv}"
                                    data-date="${cell.iso}"
                                    data-minutes="${cell.minutes}"
                                    data-completed="${cell.completed_items}"
                                    data-answers="${cell.answer_count}"
                                    aria-label="${escapeHtml(formatHeatmapDate(cell.iso))} ${cell.minutes}分钟"></button>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="heatmap-legend">
                <span>少</span>
                <span class="heatmap-cell l0" aria-hidden="true"></span>
                <span class="heatmap-cell l1" aria-hidden="true"></span>
                <span class="heatmap-cell l2" aria-hidden="true"></span>
                <span class="heatmap-cell l3" aria-hidden="true"></span>
                <span class="heatmap-cell l4" aria-hidden="true"></span>
                <span>多</span>
            </div>
        </div>
    `;

    container.querySelectorAll('.heatmap-cell[data-date]').forEach(cell => {
        cell.addEventListener('mouseenter', e => showHeatmapTooltip(e, cell));
        cell.addEventListener('mousemove', positionHeatmapTooltip);
        cell.addEventListener('mouseleave', hideHeatmapTooltip);
        cell.addEventListener('focus', e => showHeatmapTooltip(e, cell));
        cell.addEventListener('blur', hideHeatmapTooltip);
    });
}