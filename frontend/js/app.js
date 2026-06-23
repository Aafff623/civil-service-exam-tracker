let resourcesCache = [];
let activeResourceTab = '备考资料';
let activeSubjectFilter = '';
let currentUser = null;
let resourceBatchMode = false;
let resourceBatchSelected = new Set();
let resourceSubjectsCache = [];

const RESOURCE_TAB_TYPES = {
    '考试大纲': ['大纲'],
    '历年试题': ['真题', '模拟题'],
    '备考资料': ['资料'],
    '政策公告': ['公告']
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

const ASYNC_MODULE_PAGES = new Set([
    'dashboard.html',
    'resources.html',
    'resource-detail.html',
    'plan.html',
    'recommendations.html',
    'statistics.html',
    'qa.html'
]);

(function bootPageVeilEarly() {
    if (!document.querySelector('.app')) return;
    showPageVeil(PAGE_LOAD_TEXT);
    scheduleShellReveal();
})();

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
    document.querySelectorAll('[data-topbar-username]').forEach(el => {
        el.textContent = user.username;
    });
    document.querySelectorAll('[data-topbar-role]').forEach(el => {
        el.textContent = user.role === 'admin' ? '管理员' : '学习者';
    });
}

function isInternalModuleLink(href) {
    if (!href || href.startsWith('http') || href.startsWith('#') || href.includes('://')) return false;
    const page = href.split('?')[0].toLowerCase();
    return Object.prototype.hasOwnProperty.call(NAV_PAGES, page) || ASYNC_MODULE_PAGES.has(page);
}

function initPageTransitions() {
    if (document.body.dataset.navBound) return;
    document.body.dataset.navBound = '1';

    const currentPage = (location.pathname.split('/').pop() || '').toLowerCase();

    document.querySelectorAll('.nav a[href], a.logo[href], a.module-link[href]').forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        if (!isInternalModuleLink(href)) return;

        link.addEventListener('mouseenter', () => {
            if (link.dataset.prefetched) return;
            link.dataset.prefetched = '1';
            const prefetch = document.createElement('link');
            prefetch.rel = 'prefetch';
            prefetch.href = href;
            document.head.appendChild(prefetch);
        }, { once: true });

        link.addEventListener('click', e => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            const target = href.split('?')[0].toLowerCase();
            const activeTarget = (NAV_PAGES[target] || target).toLowerCase();
            const activeCurrent = (NAV_PAGES[currentPage] || currentPage).toLowerCase();
            if (activeTarget === activeCurrent) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            navigateToModule(href);
        });
    });
}

function scheduleModuleReadyFallback() {
    const page = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
    if (!ASYNC_MODULE_PAGES.has(page)) {
        notifyModuleReady();
    }
    setTimeout(() => notifyModuleReady(), 3000);
}

async function initApp() {
    if (!document.querySelector('.app')) return;

    syncNavActive();
    initPageTransitions();
    initSurfaceSpotlight();
    initMobileNav();
    scheduleModuleReadyFallback();
    // Defer so page modules (dashboard.js, plan.js, …) register listeners first
    setTimeout(() => {
        window.dispatchEvent(new Event('app:ready'));
    }, 0);

    const meResult = await getMe();
    if (!meResult.ok || !meResult.data.success) {
        window.location.replace('login.html');
        return;
    }

    const user = meResult.data.data;
    currentUser = user;
    syncSidebarMeta(user);

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
        void initResourcesPage(user);
    }
}

async function initResourcesPage(user) {
    const tabs = document.querySelectorAll('#resource-tabs .tab');
    tabs.forEach(tab => {
        if (tab.dataset.bound) return;
        tab.dataset.bound = '1';
        tab.addEventListener('click', async () => {
            if (tab.classList.contains('active')) return;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeResourceTab = tab.getAttribute('data-tab');
            const list = document.getElementById('resource-list');
            await transitionSection(list, async () => {
                renderResourceList();
            });
        });
    });

    const search = document.getElementById('resource-search');
    if (search && !search.dataset.bound) {
        search.dataset.bound = '1';
        search.addEventListener('input', () => renderResourceList());
    }

    initResourceAdmin(user);
    await loadResourceSubjects();
    await loadAllResources();
}

function isResourceAdmin(user) {
    return user && user.role === 'admin';
}

function updateBatchToolbar() {
    const toolbar = document.getElementById('batch-toolbar');
    const countEl = document.getElementById('batch-count');
    const deleteBtn = document.getElementById('btn-batch-delete');
    const count = resourceBatchSelected.size;

    if (countEl) countEl.textContent = `已选 ${count} 项`;
    if (deleteBtn) deleteBtn.disabled = count === 0;
    if (toolbar) toolbar.hidden = !resourceBatchMode;
}

function setResourceBatchMode(enabled) {
    resourceBatchMode = enabled;
    if (!enabled) resourceBatchSelected.clear();
    document.body.classList.toggle('resource-batch-mode', enabled);
    updateBatchToolbar();
    renderResourceList();
}

function populateUploadSubjectSelect() {
    const select = document.getElementById('upload-subject');
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">通用（不限科目）</option>' +
        resourceSubjectsCache.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    if (current) select.value = current;
}

function syncUploadTypeWithTab() {
    const typeSelect = document.getElementById('upload-type');
    if (!typeSelect) return;
    const types = RESOURCE_TAB_TYPES[activeResourceTab] || ['资料'];
    const preferred = types[0];
    if ([...typeSelect.options].some(opt => opt.value === preferred)) {
        typeSelect.value = preferred;
    }
}

function initResourceAdmin(user) {
    const panel = document.getElementById('resource-admin-panel');
    if (!panel || panel.dataset.bound) return;
    panel.dataset.bound = '1';

    const isAdmin = isResourceAdmin(user);
    const roleEl = document.getElementById('resource-admin-role');
    const hintEl = document.getElementById('resource-admin-hint');

    if (roleEl) {
        roleEl.textContent = isAdmin ? '管理员视图' : '只读视图';
    }
    if (hintEl && !isAdmin) {
        hintEl.textContent = '当前账号无管理权限。请使用管理员账号（如 root）登录后可上传、分类与批量删除。';
    }

    bindModalDismiss('modal-upload-resource');
    bindModalDismiss('modal-new-category');

    const guardAdmin = action => {
        if (!isAdmin) {
            showToast('需要管理员权限，请使用 root 账号登录', 'error');
            return false;
        }
        return action();
    };

    document.getElementById('btn-upload-resource')?.addEventListener('click', () => {
        guardAdmin(() => {
            syncUploadTypeWithTab();
            populateUploadSubjectSelect();
            openModal('modal-upload-resource');
        });
    });

    document.getElementById('btn-new-category')?.addEventListener('click', () => {
        guardAdmin(() => openModal('modal-new-category'));
    });

    document.getElementById('btn-batch-manage')?.addEventListener('click', () => {
        guardAdmin(() => setResourceBatchMode(!resourceBatchMode));
    });

    document.getElementById('btn-batch-cancel')?.addEventListener('click', () => {
        setResourceBatchMode(false);
    });

    document.getElementById('btn-batch-delete')?.addEventListener('click', async () => {
        if (!isAdmin || resourceBatchSelected.size === 0) return;
        const ids = [...resourceBatchSelected];
        if (!window.confirm(`确定删除选中的 ${ids.length} 条资源吗？`)) return;

        const btn = document.getElementById('btn-batch-delete');
        setButtonLoading(btn, true, '删除中');
        const result = await batchDeleteResources(ids);
        setButtonLoading(btn, false);

        if (!result.ok || !result.data.success) {
            showToast(result.data?.message || '批量删除失败', 'error');
            return;
        }

        showToast(result.data.message || '删除成功', 'success');
        setResourceBatchMode(false);
        await loadAllResources();
    });

    document.getElementById('form-upload-resource')?.addEventListener('submit', async e => {
        e.preventDefault();
        if (!isAdmin) return;

        const submitBtn = document.getElementById('btn-submit-upload');
        const title = document.getElementById('upload-title')?.value.trim();
        const type = document.getElementById('upload-type')?.value;
        const subject_id = document.getElementById('upload-subject')?.value || null;
        const content = document.getElementById('upload-content')?.value.trim();
        const url = document.getElementById('upload-url')?.value.trim();

        if (!title) {
            showToast('请填写资源标题', 'error');
            return;
        }

        setButtonLoading(submitBtn, true, '上传中');
        const result = await createResource({ title, type, subject_id, content, url });
        setButtonLoading(submitBtn, false);

        if (!result.ok || !result.data.success) {
            showToast(result.data?.message || '上传失败', 'error');
            return;
        }

        showToast('资源已上传', 'success');
        e.target.reset();
        closeModal('modal-upload-resource');
        await loadAllResources();
    });

    document.getElementById('form-new-category')?.addEventListener('submit', async e => {
        e.preventDefault();
        if (!isAdmin) return;

        const submitBtn = document.getElementById('btn-submit-category');
        const name = document.getElementById('category-name')?.value.trim();
        if (!name) {
            showToast('请填写分类名称', 'error');
            return;
        }

        setButtonLoading(submitBtn, true, '创建中');
        const result = await createSubject(name);
        setButtonLoading(submitBtn, false);

        if (!result.ok || !result.data.success) {
            showToast(result.data?.message || '创建失败', 'error');
            return;
        }

        showToast('分类已创建', 'success');
        e.target.reset();
        closeModal('modal-new-category');
        await loadResourceSubjects();
        populateUploadSubjectSelect();
    });

    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (resourceBatchMode) {
            setResourceBatchMode(false);
            return;
        }
        closeModal('modal-upload-resource');
        closeModal('modal-new-category');
    });
}

async function loadResourceSubjects() {
    const container = document.getElementById('resource-subject-tags');
    if (!container) return;

    const result = await getSubjects();
    if (!result.ok || !result.data.success) return;

    const subjects = result.data.data.items || [];
    resourceSubjectsCache = subjects;
    populateUploadSubjectSelect();
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
        const dateStr = item.created_at ? String(item.created_at).slice(0, 10) : '';
        const selected = resourceBatchSelected.has(String(item.id));
        return `
            <article class="resource-card surface-spotlight${selected ? ' is-selected' : ''}" data-resource-id="${item.id}" tabindex="0" role="button">
                ${resourceBatchMode ? `<span class="resource-batch-check${selected ? ' is-checked' : ''}" aria-hidden="true"></span>` : ''}
                ${resourceThumbHtml(item)}
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
        const id = card.getAttribute('data-resource-id');
        if (resourceBatchMode) {
            const toggleSelect = () => {
                const key = String(id);
                if (resourceBatchSelected.has(key)) {
                    resourceBatchSelected.delete(key);
                    card.classList.remove('is-selected');
                    card.querySelector('.resource-batch-check')?.classList.remove('is-checked');
                } else {
                    resourceBatchSelected.add(key);
                    card.classList.add('is-selected');
                    card.querySelector('.resource-batch-check')?.classList.add('is-checked');
                }
                updateBatchToolbar();
            };
            card.addEventListener('click', toggleSelect);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSelect();
                }
            });
            return;
        }

        const showDetail = () => {
            if (!id) return;
            card.classList.add('is-pressed');
            setTimeout(() => {
                card.classList.remove('is-pressed');
                navigateToModule(`resource-detail.html?id=${encodeURIComponent(id)}`);
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

    initSurfaceSpotlight();
}

if (document.querySelector('.app')) {
    initApp();
}