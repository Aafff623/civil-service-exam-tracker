function buildResourceToc(bodyEl, tocNavEl, tocAsideEl, scrollEl) {
    if (!bodyEl || !tocNavEl) return;

    const links = [];
    const inlineToc = bodyEl.querySelector('.resource-toc');
    if (inlineToc) {
        inlineToc.querySelectorAll('a[href^="#"]').forEach(a => {
            links.push({ href: a.getAttribute('href'), label: a.textContent.trim() });
        });
    }

    if (!links.length) {
        bodyEl.querySelectorAll('.resource-chapter > h2, section[id] > h2, h2[id]').forEach(h => {
            const section = h.closest('section[id], .resource-chapter[id]') || h.parentElement;
            const id = section?.id || h.id;
            if (!id) return;
            if (!section.id) section.id = id;
            links.push({ href: `#${id}`, label: h.textContent.trim() });
        });
    }

    if (!links.length) {
        if (tocAsideEl) tocAsideEl.hidden = true;
        return;
    }

    tocNavEl.innerHTML = links.map(link => {
        const id = link.href.replace('#', '');
        return `<a href="${escapeHtml(link.href)}" data-target="${escapeHtml(id)}">${escapeHtml(link.label)}</a>`;
    }).join('');

    if (tocAsideEl) tocAsideEl.hidden = false;

    const navLinks = [...tocNavEl.querySelectorAll('a[data-target]')];
    const sections = links
        .map(link => document.getElementById(link.href.replace('#', '')))
        .filter(Boolean);

    function setActive(targetId) {
        navLinks.forEach(a => {
            a.classList.toggle('is-active', a.dataset.target === targetId);
        });
    }

    navLinks.forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(a.dataset.target);
            if (!target || !scrollEl) return;
            const containerTop = scrollEl.getBoundingClientRect().top;
            const targetTop = target.getBoundingClientRect().top;
            const top = scrollEl.scrollTop + (targetTop - containerTop) - 12;
            scrollEl.scrollTo({ top, behavior: 'smooth' });
            setActive(a.dataset.target);
        });
    });

    if (!scrollEl || !sections.length) return;

    const onScroll = () => {
        const containerTop = scrollEl.getBoundingClientRect().top;
        let current = sections[0].id;
        sections.forEach(section => {
            const relativeTop = section.getBoundingClientRect().top - containerTop;
            if (relativeTop <= 48) current = section.id;
        });
        setActive(current);
    };

    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

async function loadResourceDetail() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const titleEl = document.getElementById('detail-title');
    const metaEl = document.getElementById('detail-meta');
    const summaryEl = document.getElementById('detail-summary');
    const bodyEl = document.getElementById('detail-body');
    const scrollEl = document.getElementById('detail-scroll');
    const tocAsideEl = document.getElementById('detail-toc');
    const tocNavEl = document.getElementById('detail-toc-nav');

    if (!id) {
        window.location.replace('resources.html');
        return;
    }

    renderLoading(bodyEl, '加载资料正文…');
    if (tocAsideEl) tocAsideEl.hidden = true;
    if (tocNavEl) tocNavEl.innerHTML = '';

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

    const practiceBtn = document.getElementById('practice-resource-btn');
    const questionCount = Number(item.question_count) || 0;
    const canPractice = questionCount > 0 && ['真题', '模拟题', '资料'].includes(item.type);
    if (practiceBtn) {
        if (canPractice) {
            practiceBtn.hidden = false;
            practiceBtn.href = `qa.html?resource_id=${encodeURIComponent(item.id)}`;
            practiceBtn.textContent = `开始练习（${questionCount} 题）`;
        } else {
            practiceBtn.hidden = true;
        }
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

    buildResourceToc(bodyEl, tocNavEl, tocAsideEl, scrollEl);
}

window.addEventListener('app:ready', loadResourceDetail);