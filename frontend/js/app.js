let resourcesCache = [];
let activeResourceTab = '备考资料';
let activeSubjectFilter = '';

const RESOURCE_TAB_TYPES = {
    '考试大纲': ['大纲'],
    '历年试题': ['真题', '模拟题'],
    '备考资料': ['资料'],
    '政策公告': ['公告']
};

const RESOURCE_TYPE_STYLE = {
    '大纲': 'icon-accent',
    '真题': 'icon-accent',
    '资料': 'icon-accent',
    '模拟题': 'icon-neutral',
    '公告': 'icon-neutral'
};

const NAV_PAGES = {
    'dashboard.html': 'dashboard.html',
    'index.html': 'dashboard.html',
    'resources.html': 'resources.html',
    'resource-detail.html': 'resources.html',
    'plan.html': 'plan.html',
    'recommendations.html': 'recommendations.html',
    'statistics.html': 'statistics.html',
    'qa.html': 'qa.html'
};

function injectAppVeil() {
    if (!document.querySelector('.app') || document.querySelector('.app-veil')) return;
    const veil = document.createElement('div');
    veil.className = 'app-veil';
    veil.setAttribute('aria-live', 'polite');
    veil.innerHTML = '<div class="app-veil-inner"><span class="spinner" aria-hidden="true"></span><span>正在加载...</span></div>';
    document.body.appendChild(veil);
    document.body.classList.add('app-pending');
}

function revealApp() {
    document.body.classList.remove('app-pending');
    document.body.classList.add('app-ready');
    const veil = document.querySelector('.app-veil');
    if (veil) {
        veil.classList.add('is-hidden');
        setTimeout(() => veil.remove(), 320);
    }
    const main = document.querySelector('.main');
    if (main) main.classList.add('main-enter');
}

function syncNavActive() {
    const page = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
    const activePage = (NAV_PAGES[page] || page).toLowerCase();
    document.querySelectorAll('.nav a').forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        link.classList.toggle('active', href === activePage);
    });
}

function syncSidebarMeta(user) {
    document.querySelectorAll('[data-username]').forEach(el => {
        el.textContent = user.username;
    });
    document.querySelectorAll('[data-avatar]').forEach(el => {
        el.textContent = user.username.charAt(0).toUpperCase();
    });
}

function initPageTransitions() {
    if (document.body.dataset.navBound) return;
    document.body.dataset.navBound = '1';

    const currentPage = (location.pathname.split('/').pop() || '').toLowerCase();

    document.querySelectorAll('.nav a[href]').forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        if (!href || href.startsWith('http') || href.startsWith('#') || href.includes('://')) return;

        link.addEventListener('click', e => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            const target = href.split('?')[0].toLowerCase();
            if (target === currentPage) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            document.body.classList.add('page-leaving');
            setTimeout(() => { window.location.href = href; }, 130);
        });
    });
}

async function initApp() {
    if (!document.querySelector('.app')) return;

    injectAppVeil();
    syncNavActive();
    initPageTransitions();

    const meResult = await getMe();
    if (!meResult.ok || !meResult.data.success) {
        window.location.replace('login.html');
        return;
    }

    const user = meResult.data.data;
    syncSidebarMeta(user);
    revealApp();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = '1';
        logoutBtn.addEventListener('click', async () => {
            setButtonLoading(logoutBtn, true, '退出中');
            await logout();
            localStorage.removeItem('user');
            showToast('已退出登录', 'info');
            setTimeout(() => { window.location.href = 'login.html'; }, 280);
        });
    }

    if (document.getElementById('resource-list')) {
        initResourcesPage();
    }

    window.dispatchEvent(new Event('app:ready'));
}

function initResourcesPage() {
    const tabs = document.querySelectorAll('#resource-tabs .tab');
    tabs.forEach(tab => {
        if (tab.dataset.bound) return;
        tab.dataset.bound = '1';
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeResourceTab = tab.getAttribute('data-tab');
            renderResourceList();
        });
    });

    const search = document.getElementById('resource-search');
    if (search && !search.dataset.bound) {
        search.dataset.bound = '1';
        search.addEventListener('input', () => renderResourceList());
    }

    loadResourceSubjects();
    loadAllResources();
}

async function loadResourceSubjects() {
    const container = document.getElementById('resource-subject-tags');
    if (!container) return;

    const result = await getSubjects();
    if (!result.ok || !result.data.success) return;

    const subjects = result.data.data.items || [];
    container.innerHTML = `
        <span class="tag active" data-subject="">全部</span>
        ${subjects.map(s => `<span class="tag gray" data-subject="${s.id}">${escapeHtml(s.name)}</span>`).join('')}
    `;

    container.querySelectorAll('[data-subject]').forEach(tag => {
        tag.addEventListener('click', () => {
            container.querySelectorAll('[data-subject]').forEach(t => {
                t.classList.remove('active');
                t.classList.add('gray');
            });
            tag.classList.add('active');
            tag.classList.remove('gray');
            activeSubjectFilter = tag.getAttribute('data-subject') || '';
            renderResourceList();
        });
    });
}

async function loadAllResources() {
    const list = document.getElementById('resource-list');
    if (!list) return;

    renderLoading(list, '加载资源中...');

    const result = await getResources();
    if (!result.ok || !result.data.success) {
        renderError(list);
        return;
    }

    resourcesCache = result.data.data.items || [];
    renderResourceList();
}

function filterResources() {
    const types = RESOURCE_TAB_TYPES[activeResourceTab] || [];
    const keyword = (document.getElementById('resource-search')?.value || '').trim().toLowerCase();

    return resourcesCache.filter(item => {
        if (types.length && !types.includes(item.type)) return false;
        if (activeSubjectFilter && String(item.subject_id) !== activeSubjectFilter) return false;
        if (keyword) {
            const hay = `${item.title} ${item.content || ''} ${item.subject_name || ''}`.toLowerCase();
            if (!hay.includes(keyword)) return false;
        }
        return true;
    });
}

function renderResourceList() {
    const list = document.getElementById('resource-list');
    const countEl = document.getElementById('resource-count');
    if (!list) return;

    const items = filterResources();

    if (countEl) {
        countEl.textContent = `共 ${items.length} 条`;
    }

    if (items.length === 0) {
        renderEmpty(list, `当前分类「${activeResourceTab}」暂无资源，试试切换标签或调整筛选。`);
        list.className = '';
        return;
    }

    list.className = 'grid grid-3';
    list.innerHTML = items.map(item => {
        const typeClass = RESOURCE_TYPE_STYLE[item.type] || 'icon-accent';
        const dateStr = item.created_at ? String(item.created_at).slice(0, 10) : '';
        return `
            <article class="resource-card" data-resource-id="${item.id}" tabindex="0" role="button">
                <div class="resource-icon ${typeClass}">${escapeHtml(item.type)}</div>
                <div>
                    <div class="resource-title">${escapeHtml(item.title)}</div>
                    <div class="resource-meta">
                        <span class="tag">${escapeHtml(item.subject_name || '通用')}</span>
                        ${Number(item.question_count) > 0 ? `<span class="tag blue">含 ${item.question_count} 道练习题</span>` : ''}
                        ${dateStr ? `<span>${escapeHtml(dateStr)}</span>` : ''}
                    </div>
                    <p class="resource-desc">${escapeHtml((item.content || '').slice(0, 72))}${(item.content || '').length > 72 ? '…' : ''}</p>
                </div>
            </article>
        `;
    }).join('');

    list.querySelectorAll('.resource-card').forEach(card => {
        const showDetail = () => {
            const id = card.getAttribute('data-resource-id');
            if (!id) return;
            card.classList.add('is-pressed');
            setTimeout(() => {
                card.classList.remove('is-pressed');
                window.location.href = `resource-detail.html?id=${encodeURIComponent(id)}`;
            }, 120);
        };
        card.addEventListener('click', showDetail);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showDetail();
            }
        });
    });
}

if (document.querySelector('.app')) {
    initApp();
}