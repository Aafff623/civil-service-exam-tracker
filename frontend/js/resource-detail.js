async function loadResourceDetail() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const titleEl = document.getElementById('detail-title');
    const metaEl = document.getElementById('detail-meta');
    const summaryEl = document.getElementById('detail-summary');
    const bodyEl = document.getElementById('detail-body');

    if (!id) {
        window.location.replace('resources.html');
        return;
    }

    renderLoading(bodyEl, '加载资料正文…');

    const result = await getResource(id);
    if (!result.ok || !result.data.success) {
        renderError(bodyEl, '资料不存在或加载失败');
        if (titleEl) titleEl.textContent = '资料未找到';
        return;
    }

    const item = result.data.data;
    document.title = `${item.title}｜公务员考试学习跟踪系统`;

    if (titleEl) titleEl.textContent = item.title;

    if (metaEl) {
        const dateStr = item.created_at ? String(item.created_at).slice(0, 10) : '';
        metaEl.innerHTML = [
            `<span class="tag">${escapeHtml(item.type)}</span>`,
            `<span class="tag gray">${escapeHtml(item.subject_name || '通用')}</span>`,
            dateStr ? `<span>收录于 ${escapeHtml(dateStr)}</span>` : ''
        ].filter(Boolean).join('');
    }

    if (summaryEl) {
        summaryEl.textContent = item.content || '';
    }

    const assetPath = item.url && String(item.url).startsWith('assets/resources/')
        ? item.url
        : null;

    if (assetPath) {
        try {
            const res = await fetch(assetPath, { credentials: 'same-origin' });
            if (!res.ok) throw new Error('fetch failed');
            const html = await res.text();
            bodyEl.innerHTML = html;
        } catch {
            bodyEl.innerHTML = `<div class="resource-excerpt"><p>${escapeHtml(item.content || '暂无正文')}</p></div>`;
        }
    } else if (item.content) {
        bodyEl.innerHTML = `<div class="resource-excerpt"><p>${escapeHtml(item.content)}</p></div>`;
    } else {
        renderEmpty(bodyEl, '该资料暂无正文内容');
    }
}

window.addEventListener('app:ready', loadResourceDetail);