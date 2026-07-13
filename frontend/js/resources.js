function getTypeBadgeClass(type) {
    const map = {
        '大纲': 'badge-outline',
        '真题': 'badge-outline',
        '模拟题': 'badge-outline',
        '资料': 'badge-outline'
    };
    return map[type] || 'badge-outline';
}

document.addEventListener('DOMContentLoaded', async () => {
    const resourceList = document.getElementById('resource-list');
    const subjectFilter = document.getElementById('subject-filter');
    const typeFilter = document.getElementById('type-filter');
    const applyFilter = document.getElementById('apply-filter');

    // Check auth
    const meResult = await getMe();
    if (!meResult.ok || !meResult.data.success) {
        if (typeof isMockMode === 'function' && isMockMode()) {
            // Mock mode provides a user; continue.
        } else {
            window.location.href = 'login.html';
            return;
        }
    }

    // Load subjects for filter
    const subjectsResult = await getSubjects();
    if (subjectsResult.ok && subjectsResult.data.success) {
        const subjects = subjectsResult.data.data.items || [];
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            subjectFilter.appendChild(option);
        });
    }

    async function loadResources() {
        resourceList.innerHTML = '<p class="text-center"><span class="spinner"></span> 正在加载资源...</p>';
        applyFilter.disabled = true;

        const params = {};
        if (subjectFilter.value) params.subject_id = subjectFilter.value;
        if (typeFilter.value) params.type = typeFilter.value;

        const result = await getResources(params);
        applyFilter.disabled = false;

        if (!result.ok || !result.data.success) {
            resourceList.innerHTML = `
                <div class="card text-center" style="border-color: var(--danger); color: var(--danger);">
                    <p>加载失败：${escapeHtml(result.data.message || '无法获取资源列表')}</p>
                    <button class="btn btn-secondary mt-1" onclick="location.reload()">重试</button>
                </div>
            `;
            return;
        }

        const items = result.data.data.items || [];
        if (items.length === 0) {
            resourceList.innerHTML = `
                <div class="card text-center">
                    <p>暂无符合条件的资源</p>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">试试调整筛选条件</p>
                </div>
            `;
            return;
        }

        resourceList.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card resource-card';
            card.innerHTML = `
                <h3>${escapeHtml(item.title)}</h3>
                <div class="resource-meta">
                    <span class="badge badge-type">${escapeHtml(item.type)}</span>
                    <span class="badge badge-subject">${escapeHtml(item.subject_name || '通用')}</span>
                </div>
                <p class="resource-summary">${escapeHtml(item.content || '')}</p>
            `;
            resourceList.appendChild(card);
        });
    }

    applyFilter.addEventListener('click', loadResources);
    loadResources();
});

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
