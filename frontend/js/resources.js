document.addEventListener('DOMContentLoaded', async () => {
    const resourceList = document.getElementById('resource-list');
    const subjectFilter = document.getElementById('subject-filter');
    const typeFilter = document.getElementById('type-filter');
    const applyFilter = document.getElementById('apply-filter');

    // Check auth
    const meResult = await getMe();
    if (!meResult.ok || !meResult.data.success) {
        window.location.href = 'login.html';
        return;
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
        resourceList.innerHTML = '<p>加载中...</p>';
        const params = {};
        if (subjectFilter.value) params.subject_id = subjectFilter.value;
        if (typeFilter.value) params.type = typeFilter.value;

        const result = await getResources(params);
        if (!result.ok || !result.data.success) {
            resourceList.innerHTML = '<p class="error">加载失败</p>';
            return;
        }

        const items = result.data.data.items || [];
        if (items.length === 0) {
            resourceList.innerHTML = '<p>暂无资源</p>';
            return;
        }

        resourceList.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card resource-card';
            card.innerHTML = `
                <h3>${escapeHtml(item.title)}</h3>
                <p><strong>类型：</strong> ${escapeHtml(item.type)}</p>
                <p><strong>科目：</strong> ${escapeHtml(item.subject_name || '通用')}</p>
                <p>${escapeHtml(item.content || '')}</p>
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
