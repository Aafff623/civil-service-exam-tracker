async function initApp() {
    const meResult = await getMe();
    if (!meResult.ok || !meResult.data.success) {
        window.location.href = 'login.html';
        return;
    }

    const user = meResult.data.data;

    // Update username displays
    document.querySelectorAll('[data-username]').forEach(el => {
        el.textContent = user.username;
    });

    // Update avatar initial
    document.querySelectorAll('[data-avatar]').forEach(el => {
        el.textContent = user.username.charAt(0).toUpperCase();
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
            window.location.href = 'login.html';
        });
    }

    // Load resources if on resources page
    if (document.getElementById('resource-list')) {
        loadResources();
    }
}

async function loadResources() {
    const list = document.getElementById('resource-list');
    if (!list) return;

    const result = await getResources();
    if (!result.ok || !result.data.success) {
        list.innerHTML = '<p class="muted">加载失败，请稍后重试</p>';
        return;
    }

    const items = result.data.data.items || [];
    if (items.length === 0) {
        list.innerHTML = '<p class="muted">暂无资源</p>';
        return;
    }

    const typeClassMap = {
        '大纲': 'icon-blue',
        '真题': 'icon-purple',
        '模拟题': 'icon-orange',
        '资料': 'icon-green'
    };

    list.innerHTML = items.map(item => {
        const typeClass = typeClassMap[item.type] || 'icon-blue';
        return `
            <article class="resource-card">
                <div class="resource-icon ${typeClass}">${escapeHtml(item.type)}</div>
                <div>
                    <div class="resource-title">${escapeHtml(item.title)}</div>
                    <div class="resource-meta">
                        <span>${escapeHtml(item.subject_name || '通用')}</span>
                        <span>${escapeHtml(item.content || '')}</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

if (document.querySelector('.app')) {
    initApp();
}
